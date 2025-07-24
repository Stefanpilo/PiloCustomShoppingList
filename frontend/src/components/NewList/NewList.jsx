import { useState } from 'react';

import { useGlobalContext } from '../../context/GlobalContext';
import { usePopup } from '../../popups/PopupContext';
import { useAuth } from '../../context/AuthContext';

import Header from '../Header/Header';
import LocalStorageHook from '../../hooks/LocalStorageHook';
import SaveOnlineDbHook from '../../hooks/SaveOnlineDbHook';

import binIcon from '../../images/bin-icon.png';

import './NewList.css'

function NewList() {
    const { ROUTES } = useGlobalContext();
    const { setTextOnlyPopup } = usePopup();
    const { isUserLoggedIn } = useAuth();

    const { localStorageDb, setLocalStorageDb } = LocalStorageHook();
    const { insertNewListWithItems } = SaveOnlineDbHook();

    const [listName, setListName] = useState('');
    const [itemsList, setItemsList] = useState([{ item_name: '', item_quantity: 1, item_checked: false, item_posInList: 0 }]);
    const [isListSaving, setIsListSaving] = useState(false);

    const addRow = () => {
        setItemsList([...itemsList, { item_name: '', item_quantity: 1, item_checked: false, item_posInList: itemsList.length }]);
    }

    const removeRow = (index) => {
        const updatedList = [...itemsList];
        updatedList.splice(index, 1);
        const sortedUpdatedList = reCalculateListItemsOrder(updatedList);
        setItemsList(sortedUpdatedList);
    }

    const moveRow = (direction, index) => {
        let indexToSwap = index;
        if (direction === 'UP')
            indexToSwap = index -1;
        else if (direction === 'DOWN')
            indexToSwap = index +1;

        setItemsList(itemsList => {
            const newItemsList = [...itemsList];
            [newItemsList[index], newItemsList[indexToSwap]] = [newItemsList[indexToSwap], newItemsList[index]];
            const sortedNewItemsList = reCalculateListItemsOrder(newItemsList);
            return sortedNewItemsList;
        });
    }

    const reCalculateListItemsOrder = (updatedList) => {
        let i = 0;
        updatedList.forEach(item => {
            item.item_posInList = i;
            i++;
        });

        return updatedList;
    }

    const handleListElementChange = (index, field, value) => {
        const updatedList = [...itemsList];
        updatedList[index][field] = value;
        setItemsList(updatedList);
    }

    async function saveList() {
        setIsListSaving(true);

        if (listName) {
            if (itemsList.length === 0) {
                setTextOnlyPopup({ message: 'Inserire almeno un elemento' });
                setIsListSaving(false);
                return;
            }

            if (itemsList.some( (item) => item.item_name === '')) {
                setTextOnlyPopup({ message: 'È presente almeno un elemento con nome vuoto.' });
                setIsListSaving(false);
                return;
            }

            /* const filteredList = listItems.filter((element) => element.item_name !== '');
            setListItems(filteredList);

            if (filteredList.length > 0) {
                const newDb = {
                    ...localStorageDb,
                    [listName]: filteredList
                };
                setLocalStorageDb(newDb);
                navigate("/");
            }
            else
                setTextOnlyPopup({message: 'Inserire almeno un elemento'}); */
        }
        else {
            setTextOnlyPopup({message: 'Inserire il nome della lista'});
            setIsListSaving(false);
            return;
        }

        if (isUserLoggedIn) {
            const dataToSave = {
                listName: listName,
                listItems: itemsList
            }

            let insertSuccessful = await insertNewListWithItems(dataToSave);

            if (insertSuccessful)
                setTextOnlyPopup({ message: 'Lista salvata con successo', destinationLink: ROUTES.HOME });
        }
        else {
            const newDb = {
                ...localStorageDb,
                [listName]: itemsList
            }
            setLocalStorageDb(newDb);

            setTextOnlyPopup({ message: 'Lista salvata con successo', destinationLink: ROUTES.HOME });
        }

        setIsListSaving(false);
    }

    return (
        <>
            <Header navBar={{backBtn: true}}/>
            <div id="new-list_root">
                <h1 className='page-h1'>
                    Nuova lista
                </h1>
                {/* TODEL */} <button onClick={() => console.log(itemsList)}>click</button> 
                <div id="new-list-name_wrapper">
                    <label htmlFor="new-list-name_input" style={{whiteSpace: "nowrap"}}>Nome Lista</label>
                    <input id="new-list-name_input" type="text" placeholder="Inserisci nome" value={listName} onChange={ (e) => setListName(e.target.value)} style={{width: "100%"}}/>
                </div>
            
                <div id="new-list-table-header">
                    <span />
                    <span>Nome elemento</span>
                    <span>Quantità</span>
                    <span />
                </div>
                
                <div id="new-list-table-body">
                    {itemsList.map( (element, index) => (
                        <div key={index} className="list-item_wrapper">
                            <div className="move-row-buttons_wrapper">
                                <button className="move-row_button move-row-up" disabled={index === 0} onClick={(e) => moveRow('UP', index)}>U</button>
                                <button className="move-row_button move-row-down" disabled={index === itemsList.length -1} onClick={(e) => moveRow('DOWN', index)}>D</button>
                            </div>
                            <input name="item-name" className="item-name" type="text" placeholder="Nome elemento" value={element.item_name} onChange={(e) => handleListElementChange(index, 'item_name', e.target.value)}></input>
                            <input name="item-quantity" className="item-quantity" type="number" placeholder="Quantità" min={1} value={element.item_quantity} onChange={(e) => handleListElementChange(index, 'item_quantity', e.target.value)}></input>
                            <button className='remove-row_button' onClick={() => removeRow(index)}>
                                <img src={binIcon} alt="bin" />
                            </button>
                        </div>
                    ))}
                </div>

                <button id="add-row_button" onClick={addRow}>+</button>

                <button id="save-list_button" className="default_button" onClick={saveList} disabled={isListSaving}>{isListSaving ? 'Salvataggio' : 'Salva lista'}</button>
            </div>
        </>
    )
}

export default NewList;