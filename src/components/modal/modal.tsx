import {FC} from "react";
import './modal.css'
import {useParams} from "react-router-dom";

const Modal: FC<{ visible: boolean , setVisible: React.Dispatch<React.SetStateAction<boolean>> | undefined }> = ({visible, setVisible}) => {
    const {room_id} = useParams()

    const setVisibility = () => setVisible ? setVisible(false) : null
    const addNewRoom = () => null

    return (
        <div className={`modal ${visible ? ' modal--show' : null}`}>
            <div className="modal__window">
                <div className="modal__input">
                    <label>Your display name</label>
                    <input/>
                </div>
                <div className="modal__buttons">
                    <button
                        className="btn"
                        onClick={addNewRoom}>New room</button>
                    { room_id ?
                        <button
                            className="btn"
                            onClick={setVisibility}>Ok</button>
                    : null
                    }
                </div>
            </div>
        </div>
    )
}

export default Modal