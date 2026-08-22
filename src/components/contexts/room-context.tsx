import { createContext, useCallback, useState, FC, ReactNode } from "react";
import { IRoomClient } from "../content/content-actions";

enum RoomStateEnum {
  PICK = "PICK",
  REVEAL = "REVEAL",
}

interface IRoomStateContext {
  roomState: RoomStateEnum | undefined;
  roomClients: IRoomClient[] | undefined;
  setRoomState: (state: RoomStateEnum, clients: IRoomClient[]) => void;
}

const RoomStateContext = createContext<IRoomStateContext>({
  roomState: RoomStateEnum.PICK,
  roomClients: [],
  setRoomState: () => null,
});

const RoomStateProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{
    roomState: RoomStateEnum | undefined;
    roomClients: IRoomClient[] | undefined;
  }>({
    roomState: undefined,
    roomClients: undefined,
  });

  const setRoomState = useCallback(
    (newState: RoomStateEnum, newClients: IRoomClient[]) => {
      setState({ roomState: newState, roomClients: newClients });
    },
    []
  );

  return (
    <RoomStateContext.Provider
      value={{ roomState: state.roomState, roomClients: state.roomClients, setRoomState }}
    >
      {children}
    </RoomStateContext.Provider>
  );
};

export { RoomStateContext, RoomStateProvider, RoomStateEnum };
