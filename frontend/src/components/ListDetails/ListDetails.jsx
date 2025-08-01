import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { usePopup } from '../../popups/PopupContext';
import { useGlobalContext } from '../../context/GlobalContext';
import { useAuth } from '../../context/AuthContext';

import Header from '../Header/Header';
import ReadOnlineDbHook from '../../hooks/ReadOnlineDbHook';
import SaveOnlineDbHook from '../../hooks/SaveOnlineDbHook';
import LocalStorageHook from '../../hooks/LocalStorageHook';

import binIcon from '../../images/bin-icon.png';
import checkboxChecked from '../../images/checkbox-checked.svg';
import checkboxUnchecked from '../../images/checkbox-unchecked.png';

import "./ListDetails.css"



function ListDetails() {
    const { isUserLoggedIn } = useAuth();

    if (isUserLoggedIn === true)
        return <OnlineListHandler />;
    else if (isUserLoggedIn === false)
        return <OfflineListHandler />;
}

function OnlineListHandler() {
    const [pageLoaded, setPageLoaded] = useState(false);
    const [isListSaving, setIsListSaving] = useState(false);
    const navigate = useNavigate();

    const { listName } = useParams();
    const { currentListID, ROUTES } = useGlobalContext();
    const { setTextOnlyPopup } = usePopup();
    const { getListItemsByListID, getListLastModifiedDate } = ReadOnlineDbHook();
    const { updateListName, updateListItems } = SaveOnlineDbHook();
    
    const [onlineDbData, setOnlineDbData] = useState([]);
    const [currentDbData, setCurrentDbData] = useState([]);
    const [newListName, setNewListName] = useState(listName);
    const [listLastModifiedDate, setListLastModifiedDate] = useState();
    const [updates, setUpdates] = useState({
        added: [],
        removed: [],
        modified: []
    });


    useEffect(() => {
        if ( onlineDbData && listName && (onlineDbData.list_name_obj === false) ) {
            navigate('/');
        }
        else if ( onlineDbData && listName && (onlineDbData.list_name_obj && (onlineDbData.list_name_obj.list_name && onlineDbData.list_name_obj.list_name !== listName)) ) {
            navigate('/');
        }
    }, [onlineDbData, listName, navigate]);

    useEffect(() => {
        if (onlineDbData?.items) {
            const itemsWithId = onlineDbData.items.map((item, index) => ({
                ...item,
                id: item.item_id ?? ( 'tmp-' + index + '-' + Date.now() )
            }));

            setCurrentDbData({
                ...onlineDbData,
                items: itemsWithId
            });

            setPageLoaded(true);
        }
    }, [onlineDbData]);

    useEffect(() => {
        if (currentListID) {
            (async () => {
                const [items, lastModified] = await Promise.all([
                    getListItemsByListID(),
                    getListLastModifiedDate()
                ]);
                setOnlineDbData(items);
                setListLastModifiedDate(lastModified);
            })();
        }
        else {
            navigate('/');
        }
    }, [currentListID, getListItemsByListID, getListLastModifiedDate, navigate]);


    function addRow() {
        const newItem = {
            id: 'tmp-' + Date.now(),
            item_name: '',
            item_quantity: 1,
            item_checked: false,
            item_posInList: currentDbData.items.length,
            list_id: currentListID
        };

        setCurrentDbData((prev) => ({
            ...prev,
            items: [ ...prev.items, newItem ]
        }));

        setUpdates((prev) => ({
            ...prev,
            added: [ ...prev.added, newItem ]
        }));
    }

    function removeRow(index) {
        const itemToRemove = currentDbData.items.find(el => el.id === index);
        const oldItemsList = [ ...currentDbData.items ];
        const newItemsList = reCalculateListItemsOrder( currentDbData.items.filter( el => el.id !== index) );
        console.log(newItemsList);

        setCurrentDbData((prev) => ({
            ...prev,
            items: newItemsList
        }));

        setUpdates((prev) => {
            let newAdded = [...prev.added];
            let newModified = [...prev.modified];
            let newRemoved = [...prev.removed];

            let i = 0;
            oldItemsList.forEach(item => {
                if (i === itemToRemove.item_posInList) {
                    const isAddedIndex = prev.added.findIndex(el => el.id === itemToRemove.id);
                    if (isAddedIndex !== -1) {
                        newAdded = prev.added.filter(el => el.id !== itemToRemove.id);
                    }
                    else {
                        newModified = prev.modified.filter(el => el.id !== itemToRemove.id);
                        newRemoved.push({
                            ...item
                        });
                    }
                }
                if ( i > itemToRemove.item_posInList) {
                    const isAddedIndex = prev.added.findIndex( el => el.id === item.id );
                    if (isAddedIndex !== -1) {
                        newAdded[isAddedIndex] = {
                            ...newAdded[isAddedIndex],
                            item_posInList: i - 1
                        };
                    }
                    else {
                        const isModifiedIndex = prev.modified.findIndex( el => el.id === item.id );
                        if (isModifiedIndex !== -1) {
                            newModified[isModifiedIndex] = {
                                ...newModified[isModifiedIndex],
                                item_posInList: i - 1
                            };
                        }
                        else {
                            newModified.push({
                                ...item,
                                item_posInList: i
                            });
                        }
                    }
                }
                i++;
            });

            return {
                ...prev,
                added: newAdded,
                modified: newModified,
                removed: newRemoved
            }
        });
    }

    function moveRow(direction, index) {
        let indexToSwap = index;
        const elToSwap1 = { ...currentDbData.items[index] };

        if (direction === 'UP')
            indexToSwap -= 1;
        else if (direction === 'DOWN')
            indexToSwap += 1;

        const elToSwap2 = { ...currentDbData.items[indexToSwap] };

        setCurrentDbData(prev => {
            const newItemsList = [...prev.items];

            [newItemsList[index], newItemsList[indexToSwap]] = [newItemsList[indexToSwap], newItemsList[index]];

            return {
                ...prev,
                items: reCalculateListItemsOrder(newItemsList)
            }
        });

        setUpdates(prev => {
            const newAdded = [...prev.added];
            const newModified = [...prev.modified];

            function checkElementToUpdate(elToSwap, posToSwap) {
                const isAddedIndex = prev.added.findIndex(el => el.id === elToSwap.id);
                if (isAddedIndex !== -1)
                    newAdded[isAddedIndex] = {
                        ...newAdded[isAddedIndex],
                        item_posInList: posToSwap
                    };
                else {
                    const isModifiedIndex = prev.modified.findIndex(el => el.id === elToSwap.id);
                    if (isModifiedIndex !== -1) {
                        newModified[isModifiedIndex] = {
                            ...newModified[isModifiedIndex],
                            item_posInList: posToSwap
                        }   
                    }
                    else {
                        newModified.push( {
                            ...elToSwap,
                            item_posInList: posToSwap
                        })
                    }
                }
            }

            checkElementToUpdate(elToSwap1, elToSwap2.item_posInList);
            checkElementToUpdate(elToSwap2, elToSwap1.item_posInList);
            
            return {
                ...prev,
                added: newAdded,
                modified: newModified
            }
        });
    }

    function reCalculateListItemsOrder(itemsListToSort) {
        let i = 0;
        itemsListToSort.forEach(item => {
            item.item_posInList = i;
            i++;
        });

        return itemsListToSort;
    }

    function updateRowValue(index, newValue, whatToUpdate) {
        let currentRow = currentDbData.items.find( (el) => el.id === index);

        switch(whatToUpdate) {
            case 'check':
                currentRow.item_checked = newValue;
            break;
            case 'name':
                currentRow.item_name = newValue;
            break;
            case 'quantity':
                currentRow.item_quantity = newValue;
            break;
            default:
                console.error('switch case error in updateRowValue');
            break;
        }

        updateRow(index, currentRow);
    }

    function updateRow(index, currentRow) {
        setCurrentDbData((prev) => ({
            ...prev,
            items: prev.items.map( (item) => item.id === index ? { ...currentRow } : item )
        }));

        setUpdates((prev) => {
            const isAdded = prev.added.find( (el) => el.id === index );
            if (isAdded) {
                //console.log('isadded');
                return {
                    ...prev,
                    added: prev.added.map( (el) => el.id === index ? { ...currentRow } : el )
                };
            }

            const isModified = prev.modified.find( (el) => el.id === index );
            if (isModified) {
                //console.log('ismodified');
                return {
                    ...prev,
                    modified: prev.modified.map( (el) => el.id === index ? { ...currentRow } : el )
                };
            }

            return {
                ...prev,
                modified: [...prev.modified, { id: index, ...currentRow }]
            };
        });
    }

    async function saveList() {
        setIsListSaving(true);
        let currentListLastModifiedDate = await getListLastModifiedDate();

        //Controllo errori
        if (currentListLastModifiedDate !== listLastModifiedDate) {
            setTextOnlyPopup({ isErrorMessage: true, message: 'Non si ha la versione aggiornata della lista.\nPremere ok per ricaricare.', shouldRefreshPage: true });
            return;
        }

        if (currentDbData.items.some((item) => item.item_name === '')) {
            setTextOnlyPopup({ isErrorMessage: true, message: 'È presente almeno un elemento con nome vuoto.' });
            setIsListSaving(false);
            return;
        }

        if (currentDbData.items.length === 0) {
            setTextOnlyPopup({ isErrorMessage: true, message: 'Nella lista non è presente alcun elemento.' });
            setIsListSaving(false);
            return;
        }
        //Fine controllo errori
        

        let listNameUpdatedResponse = false;
        if (newListName !== listName)
            listNameUpdatedResponse = await updateListName(newListName);

        currentDbData.items.map((item) => item.item_quantity === '' ? item.item_quantity = 1 : item.item_quantity);

        let response = await updateListItems(updates);

        if (response || listNameUpdatedResponse) {
            //console.log('salvato. risposta:');
            //console.log(response);
            setListLastModifiedDate( await getListLastModifiedDate() );
            setTextOnlyPopup({ message: 'Lista salvata con successo', destinationLink: ROUTES.LIST_DETAILS + '/' + newListName});
        }
        else {
            console.log('nessun aggiornamento da fare');
        }

        setUpdates((prev) => ({
            added: [],
            removed: [],
            modified: []
        }));

        setIsListSaving(false);
    }

    return (
        <>
            <Header navBar={{backBtn: true}}/>
            <div id="list-details_root">
                {!currentDbData ? (
                    <h1 className='page-h1'>
                        Nessuna lista trovata con nome {listName}
                    </h1>
                )
                : ( <>
                    <h1 className="page-h1" contentEditable suppressContentEditableWarning={true} onInput={(e) => setNewListName(e.target.textContent)}>
                        {listName}
                    </h1>
                    {/* TO DEL <button onClick={() => {console.log(currentDbData); console.log(updates);}}>show list</button> */}
                    {!pageLoaded ?
                        <div style={{marginTop: 50}}>Caricamento...</div>
                    : (<>
                        <div id="list-details-table-header">
                            <span style={{gridColumn: 3}}>Nome elemento</span>
                            <span>Quantità</span>
                        </div>
                    <div id="list-details-table-body">
                        {currentDbData && currentDbData.items && currentDbData.items.map((item, index) => (
                            !item.isRemoved && (
                                <div key={index} className={"list-item_wrapper" + (item.item_checked ? ' checked' : '' )}>
                                    <button className="toggle-check-item_button" onClick={() => updateRowValue(item.id, Number(!item.item_checked), 'check')}>
                                        {!item.item_checked ? <img src={checkboxUnchecked} alt="unckeck"/> : <img src={checkboxChecked} alt="check" />}
                                    </button>
                                    <div className="move-row-buttons_wrapper">
                                        <button className="move-row_button move-row-up" disabled={index === 0} onClick={(e) => moveRow('UP', index)}>U</button>
                                        <button className="move-row_button move-row-down" disabled={index === currentDbData.items.length -1} onClick={(e) => moveRow('DOWN', index)}>D</button>
                                    </div>
                                    <input name="item-name" className="item-name" type="text" placeholder="Nome elemento" value={item.item_name || ''} onChange={(e) => updateRowValue(item.id, e.target.value, 'name')} />
                                    <input name="item-quantity" className="item-quantity" type="number" placeholder="Quantità" min={1} value={item.item_quantity || 1} onChange={(e) => updateRowValue(item.id, Number(e.target.value) === 0 ? '' : Number(e.target.value), 'quantity')} />
                                    <button className="remove-row_button" onClick={() => removeRow(item.id)}>
                                        <img src={binIcon} alt="bin" />
                                    </button>
                                </div>
                            )
                        ))}
                    </div>
                    <button id="add-row_button" onClick={addRow}>+</button>
                    
                    <button id="save-list_button" className="default_button" onClick={saveList} disabled={isListSaving}>{isListSaving ? 'Salvataggio' : 'Salva lista'}</button>
                    </>)}
                </>)}
            </div>
        </>
    );
}

function OfflineListHandler() {
    const { setTextOnlyPopup } = usePopup();
    const { listName } = useParams();
    const { ROUTES } = useGlobalContext();
    const { localStorageDb, setLocalStorageDb } = LocalStorageHook();
    
    const [newListName, setNewListName] = useState(listName);
    const [itemsList, setItemsList] = useState([]);

    useEffect( () => {
        if (localStorageDb[listName])
            setItemsList(localStorageDb[listName]);
    }, [localStorageDb, listName]);

    
    const addRow = () => {
        setItemsList([...itemsList, {item_name: '', item_quantity: 1, item_checked: false, item_posInList : itemsList.length}]);
    }
    
    const removeRow = (index) => {
        const updatedList = [...itemsList];
        updatedList.splice(index, 1);
        setItemsList(reCalculateListItemsOrder(updatedList));
    }

    const moveRow = (direction, index) => {
        let indexToSwap = index;
        if (direction === 'UP')
            indexToSwap -= 1;
        else if (direction === 'DOWN')
            indexToSwap += 1;
        
        setItemsList(itemsList => {
            const newItemsList = [...itemsList];
            [newItemsList[index], newItemsList[indexToSwap]] = [newItemsList[indexToSwap], newItemsList[index]];
            return reCalculateListItemsOrder(newItemsList);
        })
    };

    function reCalculateListItemsOrder(itemsListToSort) {
        let i = 0;
        itemsListToSort.forEach(item => {
            item.item_posInList = i;
            i++;
        });

        return itemsListToSort;
    };
    
    function handleCheckClick(index) {
        const updateItemList = itemsList.map( (element, i) => 
            i === index ? { ...element, item_checked: !element.item_checked } : element
        );
        setItemsList(updateItemList);
    }

    const handleListItemChange = (index, field, value) => {
        const updatedList = [...itemsList];
        updatedList[index][field] = value;
        setItemsList(updatedList);
    }

    function saveList() {
        const itemsListToSave = itemsList.filter((item) => item.item_name !== '');
        itemsListToSave.map((item) => item.item_quantity === '' ? item.item_quantity = 1 : item.item_quantity);


        if (!newListName) {
            setTextOnlyPopup({ isErrorMessage: true, message: 'Inserire il nome della lista' });
            return;
        }
        if (itemsList.length === 0) {
            setTextOnlyPopup({ isErrorMessage: true, message: 'Inserire almeno un elemento' });
            return;
        }

        if (newListName !== listName) {
            const { [listName]: removed, ...rest } = localStorageDb;
            const newDb = {
                ...rest,
                [newListName]: itemsListToSave
            }
            setLocalStorageDb(newDb);
        }
        else {
            const newDb = {
                ...localStorageDb,
                [listName]: itemsListToSave
            }
            setLocalStorageDb(newDb);
        }

        setTextOnlyPopup({message: 'Lista salvata con successo', destinationLink: ROUTES.LIST_DETAILS + '/' + newListName});
    }

    return (
        <>
            <Header navBar={{backBtn: true}}/>
            <div id="list-details_root">
                {(!localStorageDb[listName]) ? (
                    <h1 className='page-h1'>
                        Nessuna lista trovata con nome {listName}
                    </h1>
                )
                : ( <>
                <h1 className="page-h1" contentEditable suppressContentEditableWarning={true} onInput={(e) => setNewListName(e.target.textContent)}>
                    {listName}
                </h1>
                <div id="list-details-table-header">
                    <span style={{gridColumn: 3}}>Nome elemento</span>
                    <span>Quantità</span>
                </div>
                <div id="list-details-table-body">
                    {itemsList.map( (element, index) => (
                        <div key={index} className={"list-item_wrapper" + (element.item_checked ? ' checked' : '')}>
                            <button className="toggle-check-item_button" onClick={() => handleCheckClick(index)}>
                                {!element.item_checked ? <img src={checkboxUnchecked} alt="unckecked" /> : <img src={checkboxChecked} alt="checked" />}
                            </button>
                            <div className="move-row-buttons_wrapper">
                                <button className="move-row_button move-row-up" disabled={index === 0} onClick={(e) => moveRow('UP', index)}>U</button>
                                <button className="move-row_button move-row-down" disabled={index === itemsList.length -1} onClick={(e) => moveRow('DOWN', index)}>D</button>
                            </div>
                            <input name="item-name" className="item-name" type="text" placeholder="Nome elemento" value={element.item_name || ''} onChange={(e) => handleListItemChange(index, 'item_name', e.target.value)}></input>
                            <input name="item-quantity" className="item-quantity" type="number" placeholder="Quantità" min={1} value={element.item_quantity} onChange={(e) => handleListItemChange(index, 'item_quantity', Number(e.target.value) === 0 ? '' : Number(e.target.value))}></input>
                            <button className="remove-row_button" onClick={() => removeRow(index)}>
                                <img src={binIcon} alt="bin" />
                            </button>
                        </div>
                    ))}
                </div>

                <button id="add-row_button" onClick={addRow}>+</button>

                <button id="save-list_button" className="default_button" onClick={saveList}>Salva lista</button>
                </>)}
            </div>
        </>
    );
}

export default ListDetails;