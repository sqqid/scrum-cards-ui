import { FC, useContext, useMemo } from "react";
import "./summary.css";
import { RoomStateContext } from "../../contexts/room-context";
import { averageOfScores, roundToTwo } from "../../../utils/math-functions";

const Summary: FC = () => {
  const roomStateContext = useContext(RoomStateContext);

  const calculateAverage = useMemo(
    () => averageOfScores(roomStateContext.roomClients?.map((client) => client.score) ?? []),
    [roomStateContext]
  );

  return <span className="summary__span">{roundToTwo(calculateAverage)}</span>;
};

export default Summary;
