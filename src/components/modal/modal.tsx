import { ChangeEvent, FC, useContext, useEffect, useState } from "react";
import "./modal.css";
import { useNavigate, useParams } from "react-router-dom";
import { ClientContext } from "../contexts/client-context";
import { IAddRoomClicked, modalActions } from "./modal-actions";
import storage from "../../constants/local-storage";
import { ModalContext } from "../contexts/modal-context";
import ErrorNotice from "../error-notice/error-notice";

const Modal: FC = () => {
  const { room_id } = useParams();
  const { id: clientId, name: clientName, changeClient } = useContext(ClientContext);
  const { visible, setVisible } = useContext(ModalContext);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string>();
  const navigate = useNavigate();

  const setVisibility = () => setVisible(false);

  const setUserName = () => {
    if (!room_id) {
      navigate(`../`);
      return;
    }
    if (input && clientId) {
      const client = { id: clientId, name: input };
      const observer = {
        next: () => {
          changeClient(client);
          saveNameToLocalStorage(input);
          setVisibility();
        },
        error: (err: Error) => setError(err.message),
      };
      modalActions.updateUserName(room_id, client, observer);
    } else if (input && !clientId) {
      modalActions.registerClient(room_id, input, {
        next: (newClientId) => {
          changeClient({ id: newClientId, name: input });
          saveNameToLocalStorage(input);
          setVisibility();
        },
        error: (err: Error) => setError(err.message),
      });
    }
  };

  const addNewRoom = () => {
    const observer = {
      next: (data: IAddRoomClicked) => {
        changeClient({ id: data.clientId, name: input });
        setVisibility();
        navigate(`../${data.roomId}`);
      },
      error: (err: Error) => setError(err.message),
    };
    modalActions.addRoomClicked(input, observer);
  };

  const inputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
    setError(undefined);
  };

  useEffect(() => {
    if (clientName) {
      setInput(clientName);
    } else {
      const name = loadNameFromLocalStorage();
      if (name) setInput(name);
    }
  }, [clientName]);

  const loadNameFromLocalStorage = () => {
    const localStorageName = localStorage.getItem(storage.CLIENT_NAME);
    if (localStorageName) {
      return localStorageName;
    }
  };

  const saveNameToLocalStorage = (name: string) => {
    localStorage.setItem(storage.CLIENT_NAME, name);
  };

  return (
    <div className={`modal ${!room_id || visible ? " modal--show" : null}`}>
      <div className="modal__window">
        <div className="modal__input">
          <label>Your display name</label>
          <input type="text" value={input} onChange={inputChange} />
        </div>
        <ErrorNotice message={error} />
        <div className="modal__buttons">
          <button className="btn" onClick={addNewRoom}>
            New room
          </button>
          {room_id ? (
            <button className="btn" onClick={setUserName}>
              Ok
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Modal;
