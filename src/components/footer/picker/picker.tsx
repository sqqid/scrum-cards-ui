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
  const { roomState } = useContext(RoomStateContext);

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

  const { number: selectedNumber } = state ?? {};

  useEffect(() => {
    if (selectedNumber !== undefined) {
      const newCards = cards.map((card) => ({
        ...card,
        selected: selectedNumber === card.number,
      }));
      setCards(newCards);
    } else {
      setCards(initialCards);
    }
  }, [selectedNumber]);

  useEffect(() => {
    setState(undefined);
    if (roomState === RoomStateEnum.REVEAL) {
      setCards(initialCards);
    }
  }, [roomState]);

  return (
    <div className="picker">
      {cards.map((card) => {
        return <PickerCard key={card.number} card={card} setSelect={setState} />;
      })}
    </div>
  );
};

export default Picker;
