import {FC, useContext, useEffect, useMemo, useState} from "react";
import './content.css';
import Table from "./table/table";
import {useNavigate, useParams} from "react-router-dom";
import {ClientContext} from "../contexts/client-context";
import {contentActions, IRoomState} from "./content-actions";
import conf from "../../constants/config";
import {RoomStateContext, RoomStateEnum} from "../contexts/room-context";


const Content: FC = () => {

    const {room_id} = useParams()
    const clientContext = useContext(ClientContext)
    const roomStateContext = useContext(RoomStateContext)
    const navigate = useNavigate()
    const [roomState, setRoomState] = useState<IRoomState>({state: RoomStateEnum.PICK, clients: []})

    useEffect(() => {
        if (!room_id) {
            navigate(`../${conf.BASE_URL}`)
            return
        }

        if (clientContext.id) {
            contentActions.openStream(room_id, clientContext.id, {
                next: async (data) => {
                    setRoomState(JSON.parse(data))
                }
            })
        } else if (!clientContext.id && clientContext.name) {
            contentActions.registerClient(room_id, clientContext.name, {
                next: (clientId) => {
                    clientContext.changeClient({id: clientId, name: clientContext.name})
                }
            })
        }

    }, [clientContext.changeClient, clientContext, navigate])


    const selectedCard = useMemo(() =>
            roomState.clients.filter(client => client.selected).length > 0
        , [roomState.clients])

    const reveal = () => {
        if (room_id) {
            contentActions.reveal(room_id);
            roomStateContext.setRoomState(RoomStateEnum.REVEAL)
        }
    }

    const newVoting = () => {
        if (room_id) {
            contentActions.newVoting(room_id);
            roomStateContext.setRoomState(RoomStateEnum.PICK)
        }
    }

    return (
        <div className="content">
            <div className="content__top">
                <div className="content__controls">
                    {
                        !selectedCard && RoomStateEnum.REVEAL !== roomState.state  ? <span>Pick your cards!</span> : null
                    }
                    {
                        RoomStateEnum.PICK === roomState.state && selectedCard ?
                            <button className="btn" onClick={reveal}>
                                <span className="btn__span btn__span--controls">Reveal cards</span>
                            </button>
                            : null
                    }
                    {
                        RoomStateEnum.REVEAL === roomState.state?
                            <button className="btn" onClick={newVoting}>
                                <span className="btn__span btn__span--controls">Start new voting</span>
                            </button>
                            : null
                    }
                </div>
            </div>
            <div className="content__bottom">
                <Table clients={roomState.clients}/>
            </div>
        </div>
    );
}

export default Content