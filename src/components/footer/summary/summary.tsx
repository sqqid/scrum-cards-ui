import {FC, useContext, useMemo} from "react";
import './summary.css'
import {RoomStateContext} from "../../contexts/room-context";

const Summary: FC = () => {
    const roomStateContext = useContext(RoomStateContext)

    const calculateAverage = useMemo(() => {
        const validNumbers = roomStateContext.roomClients?.map(client => client.score)
            .filter(score => score)
            .filter(score => !isNaN(parseInt(score)))
            .map(score => parseInt(score, 10))

        return validNumbers ? validNumbers.reduce((a,b) => a + b) / validNumbers.length : 0
    }, [roomStateContext])

    return (
        <span className="summary__span">{calculateAverage}</span>
    )
}

export default Summary