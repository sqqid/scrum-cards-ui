import { FC, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClientContext } from "../contexts/client-context";
import { ModalContext } from "../contexts/modal-context";
import { RoomStateContext, RoomStateEnum } from "../contexts/room-context";
import { contentActions, IRoomState } from "./content-actions";
import "./content.css";
import Table from "./table/table";

const Content: FC = () => {
  const { room_id } = useParams();
  const clientContext = useContext(ClientContext);
  const roomStateContext = useContext(RoomStateContext);
  const modalContext = useContext(ModalContext);
  const navigate = useNavigate();
  const [roomState, setRoomState] = useState<IRoomState>({
    state: RoomStateEnum.PICK,
    clients: [],
  });

  useEffect(() => {
    if (!room_id) {
      navigate(`../`);
      return;
    }

    if (clientContext.id) {
      const subscription = contentActions.openStream(room_id, clientContext.id, {
        next: (data) => {
          const roomData: IRoomState = JSON.parse(data);
          setRoomState(roomData);
          if (roomStateContext) {
            roomStateContext.setRoomState(roomData.state as RoomStateEnum, roomData.clients);
          }
        },
      });
      return () => subscription.unsubscribe();
    } else if (modalContext.setVisible) {
      modalContext.setVisible(true);
    }
  }, [room_id, clientContext.id]);

  const selectedCard = useMemo(
    () => roomState.clients.filter((client) => client.selected).length > 0,
    [roomState.clients]
  );

  const reveal = () => {
    if (room_id && roomStateContext.roomClients) {
      contentActions.reveal(room_id);
    }
  };

  const newVoting = () => {
    if (room_id && roomStateContext.roomClients) {
      contentActions.newVoting(room_id);
    }
  };

  return (
    <div className="content">
      <div className="content__top">
        <div className="content__controls">
          {!selectedCard && clientContext.id && RoomStateEnum.REVEAL !== roomState.state ? (
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
