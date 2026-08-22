import { FC, useContext, useMemo } from "react";
import "./summary.css";
import { RoomStateContext } from "../../contexts/room-context";
import { averageOfScores, roundToTwo } from "../../../utils/math-functions";

const Summary: FC = () => {
  const { roomClients } = useContext(RoomStateContext);

  const calculateAverage = useMemo(
    () => averageOfScores(roomClients?.map((client) => client.score) ?? []),
    [roomClients]
  );

  return <span className="summary__span">{roundToTwo(calculateAverage)}</span>;
};

export default Summary;
