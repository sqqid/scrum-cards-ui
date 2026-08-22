import { Dispatch, FC, SetStateAction, useContext } from "react";
import "./picker-card.css";
import { ICardState } from "../picker";
import { pickerCardActions } from "./picker-card-actions";
import { useParams } from "react-router-dom";
import { ClientContext } from "../../../contexts/client-context";

const PickerCard: FC<{
  card: ICardState;
  setSelect: Dispatch<SetStateAction<ICardState | undefined>>;
  onError?: (error: Error) => void;
}> = ({ card, setSelect, onError }) => {
  const { room_id } = useParams();
  const clientContext = useContext(ClientContext);

  const toggleSelection = () => {
    if (room_id && clientContext.id && setSelect) {
      if (card.selected) {
        pickerCardActions.removeCard(room_id, clientContext.id, onError);
        setSelect(undefined);
      } else {
        pickerCardActions.pickCard(room_id, clientContext.id, card.number, onError);
        setSelect({ number: card.number, selected: !card.selected });
      }
    }
  };

  return (
    <div
      className={"picker__card" + (card.selected ? " picker__card--selected" : "")}
      onClick={toggleSelection}
    >
      <span>{card.number}</span>
    </div>
  );
};

export default PickerCard;
