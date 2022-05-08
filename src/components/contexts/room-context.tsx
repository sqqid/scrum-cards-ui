import {createContext, useState} from "react";
import {IRoomClient} from "../content/content-actions";

enum RoomStateEnum {
    PICK = "PICK",
    REVEAL = "REVEAL"
}

interface IRoomStateContext {
    roomState: RoomStateEnum | undefined,
    setRoomState: (state: RoomStateEnum) => void
}

const RoomStateContext = createContext<IRoomStateContext>({roomState: RoomStateEnum.PICK, setRoomState: () => null})

// @ts-ignore
const RoomStateProvider = ({children}) => {
    const [state, setState] = useState<RoomStateEnum>()

    const setRoomState = (state: RoomStateEnum) => {
        setState(state)
    }

    return (
        <RoomStateContext.Provider value={{roomState: state, setRoomState}}>
            {children}
        </RoomStateContext.Provider>
    )
}

export {RoomStateContext, RoomStateProvider, RoomStateEnum}

