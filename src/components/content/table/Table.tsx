import React from "react";
import './Table.css'
import TableCard from "./table_card/TableCard";

const Table: React.FC = () => {
    return (
        <div className="table">
            <TableCard/>
        </div>
    )
}

export default Table