import {ChangeEvent, FC, useContext, useEffect, useState} from "react";
import './modal.css'
import {useNavigate, useParams} from "react-router-dom";
import {ClientContext} from "../contexts/client-context";
import conf from "../../constants/config";
import {IAddRoomClicked, modalActions} from "./modal-actions";
import storage from "../../constants/local-storage";
import {ModalContext} from "../contexts/modal-context";


const Modal: FC = () => {
    const {room_id} = useParams()
    const clientContext = useContext(ClientContext)
    const modalContext = useContext(ModalContext)
    const [input, setInput] = useState('')
    const navigate = useNavigate()

    const setVisibility = () => modalContext.setVisible ? modalContext.setVisible(false) : null

    const setUserName = () => {
        if (!room_id) {
            navigate(`../${conf.BASE_URL}`)
            return
        }
        if (input && clientContext.id) {
            const client = {id: clientContext.id, name: input}
            const observer = {
                next: () => {
                    clientContext.changeClient(client)
                    saveNameToLocalStorage(input)
                }
            }
            modalActions.updateUserName(room_id, client, observer)
        } else if (input && !clientContext.id) {
            modalActions.registerClient(room_id, input, {
                next: (clientId) => {
                    clientContext.changeClient({id: clientId, name: input})
                    saveNameToLocalStorage(input)
                }
            })
        }

        setVisibility()
    }

    const addNewRoom = () => {
        const observer = {
            next: (data: IAddRoomClicked) => {
                clientContext.changeClient({id: data.clientId, name: input})
                navigate(`../${conf.BASE_URL}${data.roomId}`)
            }
        }
        modalActions.addRoomClicked(input, observer);
        setVisibility()
    }

    const inputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value)
    }

    useEffect(() => {
        if (clientContext.name) {
            setInput(clientContext.name)
        } else {
            const name = loadNameFromLocalStorage()
            if (name) setInput(name)
        }
    }, [clientContext])


    const loadNameFromLocalStorage = () => {
        const localStorageName = localStorage.getItem(storage.CLIENT_NAME)
        if (localStorageName) {
            return localStorageName
        }
    }

    const saveNameToLocalStorage = (name: string) => {
        localStorage.setItem(storage.CLIENT_NAME, name)
    }

    return (
        <div className={`modal ${ !room_id || modalContext.visible ? ' modal--show' : null}`}>
            <div className="modal__window">
                <div className="modal__input">
                    <label>Your display name</label>
                    <input
                        type="text"
                        value={input}
                        onChange={inputChange}/>
                </div>
                <div className="modal__buttons">
                    <button
                        className="btn"
                        onClick={addNewRoom}>New room
                    </button>
                    {room_id ?
                        <button
                            className="btn"
                            onClick={setUserName}>Ok</button>
                        : null
                    }
                </div>
            </div>
        </div>
    )
}

export default Modal