import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClientContext } from "../contexts/client-context";
import { ModalContext } from "../contexts/modal-context";
import { RoomStateContext, RoomStateEnum } from "../contexts/room-context";
import { contentActions, IRoomState } from "./content-actions";
import ErrorNotice from "../error-notice/error-notice";
import conf from "../../constants/config";
import storage from "../../constants/local-storage";
import "./content.css";
import Table from "./table/table";

const Content: FC = () => {
  const { room_id } = useParams();
  const { id: clientId, name: clientName, changeClient } = useContext(ClientContext);
  const { roomClients, setRoomState: applyRoomState } = useContext(RoomStateContext);
  const { setVisible } = useContext(ModalContext);
  const navigate = useNavigate();
  const [roomState, setRoomState] = useState<IRoomState>({
    state: RoomStateEnum.PICK,
    clients: [],
  });
  const [error, setError] = useState<string>();
  const clientNameRef = useRef(clientName);
  clientNameRef.current = clientName;
  const rejoinAttempts = useRef(0);
  const lastRoomId = useRef<string | undefined>(undefined);

  // The backend removes a Client when its stream disconnects (ADR 0005), so a
  // failed stream strands the participant: re-register a new Client with the
  // same display name and let the stream effect open a fresh stream. Score and
  // Selected do not survive the rejoin.
  const rejoin = useCallback(
    (err: Error) => {
      if (!room_id) {
        return;
      }
      const attemptRejoin = (currentErr: Error) => {
        if (rejoinAttempts.current >= conf.MAX_REJOIN_ATTEMPTS) {
          setError(currentErr.message);
          return;
        }
        rejoinAttempts.current += 1;
        const name = clientNameRef.current || localStorage.getItem(storage.CLIENT_NAME);
        if (!name) {
          setError(currentErr.message);
          return;
        }
        contentActions.rejoinClient(room_id, name, {
          next: (newClientId: string) => {
            changeClient({ id: newClientId, name });
          },
          error: (regErr: Error) => {
            attemptRejoin(regErr);
          },
        });
      };
      attemptRejoin(err);
    },
    [room_id, changeClient]
  );

  useEffect(() => {
    if (!room_id) {
      navigate(`../`);
      return;
    }

    if (lastRoomId.current !== room_id) {
      lastRoomId.current = room_id;
      rejoinAttempts.current = 0;
    }

    if (clientId) {
      // A failed stream terminates its subscription, which closes the
      // EventSource; the effect cleanup below closes it on rejoin/unmount.
      const subscription = contentActions.openStream(room_id, clientId, {
        next: (data) => {
          rejoinAttempts.current = 0;
          const roomData: IRoomState = JSON.parse(data);
          setRoomState(roomData);
          applyRoomState(roomData.state as RoomStateEnum, roomData.clients);
          setError(undefined);
        },
        error: (err) => rejoin(err),
      });
      return () => subscription.unsubscribe();
    } else {
      setVisible(true);
    }
  }, [room_id, clientId, applyRoomState, setVisible, navigate, rejoin]);

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
