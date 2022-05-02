import React from "react";
import './TableCard.css'

const TableCard: React.FC = () => {
    return (
        <div className="table__card">
           <div className="card__number card__number--selected">
              <span></span>
           </div>
           <span className="card__name">Marcin J</span>
        </div>
    )
}

export default TableCard