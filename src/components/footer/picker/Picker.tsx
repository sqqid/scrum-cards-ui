import React from "react";
import './Picker.css'
import PickerCard from "./picker_card/PickerCard";

const Picker: React.FC = () => {
    const fibonacci: (number | string)[] = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?']

    return (
        <div className="picker">
            {fibonacci.map(fib => {
                return (
                    <PickerCard
                        key={fib}
                        fib_num={fib}
                        selected={false}
                    />
                )
            })}
        </div>
    )
}

export default Picker