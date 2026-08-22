import { FC, useContext } from "react";
import "./footer.css";
import Picker from "./picker/picker";
import { RoomStateContext, RoomStateEnum } from "../contexts/room-context";
import Summary from "./summary/summary";

const Footer: FC = () => {
  const roomStateContext = useContext(RoomStateContext);

  const decription = () => {
    let text = "Choose your card :";
    if (roomStateContext.roomState) {
      switch (roomStateContext.roomState) {
        case RoomStateEnum.PICK:
          break;
        case RoomStateEnum.REVEAL:
          text = "Average :";
          break;
        default:
          break;
      }
    }
    return text;
  };

  return (
    <div className="footer">
      <span>{decription()}</span>
      {!roomStateContext.roomState || roomStateContext.roomState === RoomStateEnum.PICK ? (
        <Picker />
      ) : (
        <Summary />
      )}
    </div>
  );
};

export default Footer;
