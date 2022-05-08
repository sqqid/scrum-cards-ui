import {FC, useContext, useEffect} from "react";
import './footer.css'
import Picker from "./picker/picker";
import {RoomStateContext, RoomStateEnum} from "../contexts/room-context";
import Summary from "./summary/summary";

const Footer: FC = () => {
    const roomStateContext = useContext(RoomStateContext)

    return (
        <div className="footer">
            {
                !roomStateContext.roomState || roomStateContext.roomState === RoomStateEnum.PICK ?
                    <>
                        <span>Choose your card:</span>
                        <Picker/>
                    </>
                    :
                    <Summary/>
            }
        </div>
    )
}

export default Footer