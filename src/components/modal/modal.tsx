import {ChangeEvent, FC, useContext, useEffect, useState} from "react";
import './modal.css'
import {useParams} from "react-router-dom";
import {ClientContext} from "../contexts/client-context";
import modalActions from "./modal.actions";


const Modal: FC<{ visible: boolean, setVisible: React.Dispatch<React.SetStateAction<boolean>> | undefined }> = (
    {visible, setVisible}) => {

    const {room_id} = useParams()
    const clientContext = useContext(ClientContext)
    const [input, setInput] = useState('')

    const setVisibility = () => setVisible ? setVisible(false) : null

    const setUserName = () => {
        if (input) clientContext.setClient({...clientContext, name: input})
        setVisibility()
    }

    const addNewRoom = () => {
        modalActions.addRoomClicked(input, clientContext);
    }

    const inputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value)
    }

    useEffect(() => {
        if (clientContext.name) setInput(clientContext.name)
    }, [clientContext])

    return (
        <div className={`modal ${visible ? ' modal--show' : null}`}>
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