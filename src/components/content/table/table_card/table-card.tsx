import {FC} from "react";
import './table-card.css'

const TableCard: FC<{card_value: (number | string), client_name: string, selected: boolean}> = ({card_value, client_name, selected}) => {
    return (
        <div className="table__card">
           <div className={`card__number ${ selected ? 'card__number--selected' : ''}`}>
              <span>{card_value}</span>
           </div>
           <span className="card__name">{client_name}</span>
        </div>
    )
}

export default TableCard