import { FC, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClientContext } from "../contexts/client-context";
import { ModalContext } from "../contexts/modal-context";
import { RoomStateContext, RoomStateEnum } from "../contexts/room-context";
import { contentActions, IRoomState } from "./content-actions";
import ErrorNotice from "../error-notice/error-notice";
import "./content.css";
import Table from "./table/table";

const Content: FC = () => {
  const { room_id } = useParams();
  const { id: clientId } = useContext(ClientContext);
  const { roomClients, setRoomState: applyRoomState } = useContext(RoomStateContext);
  const { setVisible } = useContext(ModalContext);
  const navigate = useNavigate();
  const [roomState, setRoomState] = useState<IRoomState>({
    state: RoomStateEnum.PICK,
    clients: [],
  });
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!room_id) {
      navigate(`../`);
      return;
    }

    if (clientId) {
      const subscription = contentActions.openStream(room_id, clientId, {
        next: (data) => {
          const roomData: IRoomState = JSON.parse(data);
          setRoomState(roomData);
          applyRoomState(roomData.state as RoomStateEnum, roomData.clients);
          setError(undefined);
        },
        error: (err) => setError(err.message),
      });
      return () => subscription.unsubscribe();
    } else {
      setVisible(true);
    }
  }, [room_id, clientId, applyRoomState, setVisible, navigate]);

  const selectedCard = useMemo(
    () => roomState.clients.filter((client) => client.selected).length > 0,
    [roomState.clients]
  );

  const reveal = () => {
    if (room_id && roomClients) {
      contentActions.reveal(room_id, (err) => setError(err.message));
    }
  };

  const newVoting = () => {
    if (room_id && roomClients) {
      contentActions.newVoting(room_id, (err) => setError(err.message));
    }
  };

  return (
    <div className="content">
      <div className="content__top">
        <div className="content__controls">
          <ErrorNotice message={error} />
          {!selectedCard && clientId && RoomStateEnum.REVEAL !== roomState.state ? (
            <span>Pick your cards!</span>
          ) : null}
          {RoomStateEnum.PICK === roomState.state && selectedCard ? (
            <button className="btn" onClick={reveal}>
              <span className="btn__span btn__span--controls">Reveal cards</span>
            </button>
          ) : null}
          {RoomStateEnum.REVEAL === roomState.state ? (
            <button className="btn" onClick={newVoting}>
              <span className="btn__span btn__span--controls">Start new voting</span>
            </button>
          ) : null}
        </div>
      </div>
      <div className="content__bottom">
        <Table clients={roomState.clients} />
      </div>
    </div>
  );
};

export default Content;
