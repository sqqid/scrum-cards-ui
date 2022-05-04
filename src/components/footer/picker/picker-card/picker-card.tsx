import {FC} from "react";
import './picker-card.css'

const PickerCard: FC<{ fib_num: (number | string), selected: boolean }> = ({fib_num, selected}) => {
    return (
        <div className={"picker__card" + (selected ? 'picker__card--selected' : '')}>
            <span>{fib_num}</span>
        </div>
    )
}

export default PickerCard