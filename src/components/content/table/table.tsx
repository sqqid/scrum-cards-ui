import {FC} from "react";
import './table.css'
import TableCard from "./table_card/table-card";

const Table: FC = () => {
    const client: { card_value: (number | string), client_name: string } = {
        card_value: 4,
        client_name: 'Marcin J'
    }

    return (
        <div className="table">
            <TableCard
                card_value={client.card_value}
                client_name={client.client_name}
                selected={false}
            />
        </div>
    )
}

export default Table