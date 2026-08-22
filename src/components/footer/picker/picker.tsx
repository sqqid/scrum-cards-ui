import { FC, useContext, useEffect, useState } from "react";
import "./picker.css";
import PickerCard from "./picker-card/picker-card";
import { RoomStateContext, RoomStateEnum } from "../../contexts/room-context";

export interface ICardState {
  number: string;
  selected: boolean;
}

const Picker: FC = () => {
  const [state, setState] = useState<ICardState>();
  const roomStateContext = useContext(RoomStateContext);

  const initialCards: ICardState[] = [
    "0",
    "1",
    "2",
    "3",
    "5",
    "8",
    "13",
    "20",
    "40",
    "100",
    "?",
  ].map((fib) => {
    return { number: `${fib}`, selected: false };
  });
  const [cards, setCards] = useState<ICardState[]>(initialCards);

  useEffect(() => {
    if (state) {
      const newCards = cards.map((card) => ({
        ...card,
        selected: state.number === card.number,
      }));
      setCards(newCards);
    } else {
      setCards(initialCards);
    }
  }, [state]);

  useEffect(() => {
    if (roomStateContext.roomState === RoomStateEnum.REVEAL) {
      setCards(initialCards);
    }
  }, [roomStateContext.setRoomState]);

  return (
    <div className="picker">
      {cards.map((card) => {
        return <PickerCard key={card.number} card={card} setSelect={setState} />;
      })}
    </div>
  );
};

export default Picker;
