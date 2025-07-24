import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useGlobalContext } from '../../context/GlobalContext';
import { usePopup } from '../../popups/PopupContext';
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
    const { currentListID } = useGlobalContext();
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
    }, [currentListID, getListItemsByListID, getListLastModifiedDate]);


    function addRow() {
        const newItem = {
            id: 'tmp-' + Date.now(),
            item_name: '',
            item_quantity: 1,
            item_checked: false,
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
        setCurrentDbData((prev) => ({
            ...prev,
            items: prev.items.filter( (el) => el.id !== index )
        }));

        setUpdates((prev) => {
            const isAdded = prev.added.find( (el) => el.id === index );
            if (isAdded) {
                //console.log('remove is added');
                return {
                    ...prev,
                    added: prev.added.filter( (el) => el.id !== index ),
                }
            }
            else {
                //console.log('remove is modified/removed');
                const alreadyRemoved = prev.removed.some( (el) => el.id === index);
                return {
                    ...prev,
                    modified: prev.modified.filter( (el) => el.id !== index),
                    removed: alreadyRemoved ? prev.removed : [ ...prev.removed, currentDbData.items.find( (el) => el.id === index) ]
                }
            }
        })
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
            setTextOnlyPopup({ message: 'Non si ha la versione aggiornata della lista.\nPremere ok per ricaricare.', shouldRefreshPage: true });
            return;
        }

        if (currentDbData.items.some( (item) => item.item_name === '')) {
            setTextOnlyPopup({ message: 'È presente almeno un elemento con nome vuoto.' });
            setIsListSaving(false);
            return;
        }

        if (currentDbData.items.length === 0) {
            setTextOnlyPopup({ message: 'Nella lista non è presente alcun elemento.' });
            setIsListSaving(false);
            return;
        }
        //Fine controllo errori
        

        if (newListName !== listName)
           updateListName(newListName);

        let response = await updateListItems(updates);

        if (response) {
            //console.log('salvato. risposta:');
            //console.log(response);
            setListLastModifiedDate( await getListLastModifiedDate() );
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
                    {!pageLoaded ?
                        <div style={{marginTop: 50}}>Caricamento...</div>
                    : (<>
                        <div id="list-details-table-header">
                            <span />
                            <span>Nome elemento</span>
                            <span>Quantità</span>
                            <span />
                        </div>
                    <div id="list-details-table-body">
                        {currentDbData && currentDbData.items && currentDbData.items.map((item, index) => (
                            !item.isRemoved && (
                                <div key={index} className={"list-item_wrapper" + (item.item_checked ? ' checked' : '' )}>
                                    <button className="toggle-check-item_button" onClick={() => updateRowValue(item.id, Number(!item.item_checked), 'check')}>
                                        {!item.item_checked ? <img src={checkboxUnchecked} alt="unckeck"/> : <img src={checkboxChecked} alt="check" />}
                                    </button>
                                    <input name="item-name" className="item-name" type="text" placeholder="Nome elemento" value={item.item_name || ''} onChange={(e) => updateRowValue(item.id, e.target.value, 'name')} />
                                    <input name="item-quantity" className="item-quantity" type="number" placeholder="Quantità" min={1} value={item.item_quantity || 1} onChange={(e) => updateRowValue(item.id, e.target.value, 'quantity')} />
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
    const { localStorageDb, setLocalStorageDb } = LocalStorageHook();
    
    const [newListName, setNewListName] = useState(listName);
    const [itemsList, setItemsList] = useState([]);

    useEffect( () => {
        if (localStorageDb[listName])
            setItemsList(localStorageDb[listName]);
    }, [localStorageDb, listName]);

    
    const addRow = () => {
        setItemsList([...itemsList, {item_name: '', item_quantity: 1, item_checked: false}]);
    }
    
    const removeRow = (index) => {
        const updatedList = [...itemsList];
        updatedList.splice(index, 1);
        setItemsList(updatedList);
    }
    
    function handleCheckClick(index) {
        const updateItemList = itemsList.map( (element, i) => 
            i === index ? { ...element, itemChecked: !element.itemChecked } : element
        );
        setItemsList(updateItemList);
    }

    const handleListItemChange = (index, field, value) => {
        const updatedList = [...itemsList];
        updatedList[index][field] = value;
        setItemsList(updatedList);
    }

    function saveList() {
        const validItemsList = itemsList.filter((item) => item.item_name !== '');

        if (!newListName) {
            setTextOnlyPopup({message: 'Inserire il nome della lista'});
            return;
        }
        if (itemsList.length === 0) {
            setTextOnlyPopup({message: 'Inserire almeno un elemento'});
            return;
        }

        if (newListName !== listName) {
            const { [listName]: removed, ...rest } = localStorageDb;
            const newDb = {
                ...rest,
                [newListName]: validItemsList
            }
            setLocalStorageDb(newDb);
        }
        else {
            const newDb = {
                ...localStorageDb,
                [listName]: validItemsList
            }
            setLocalStorageDb(newDb);
        }

        setTextOnlyPopup({message: 'Lista salvata con successo'});
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
                    <span />
                    <span>Nome elemento</span>
                    <span>Quantità</span>
                    <span />
                </div>
                <div id="list-details-table-body">
                    {itemsList.map( (element, index) => (
                        <div key={index} className={"list-item_wrapper" + (element.itemChecked ? ' checked' : '')}>
                            <button className="toggle-check-item_button" onClick={() => handleCheckClick(index)}>
                                {!element.itemChecked ? <img src={checkboxUnchecked} alt="unckecked" /> : <img src={checkboxChecked} alt="checked" />}
                            </button>
                            <input name="item-name" className="item-name" type="text" placeholder="Nome elemento" value={element.item_name || ''} onChange={(e) => handleListItemChange(index, 'item_name', e.target.value)}></input>
                            <input name="item-quantity" className="item-quantity" type="number" placeholder="Quantità" min={1} value={element.item_quantity || 1} onChange={(e) => handleListItemChange(index, 'item_quantity', e.target.value)}></input>
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