import {FC} from "react";
import './table.css'
import TableCard from "./table_card/table-card";
import {IRoomClient} from "../content-actions";


const Table: FC<{ clients: IRoomClient[] }> = ({clients}) => {

    return (
        <div className="table">
            {clients ? clients.map(client => {
                return (
                    <TableCard
                        key={client.client_id}
                        card_value={client.score}
                        client_name={client.client_name}
                        selected={client.selected}
                    />
                )
            }) : null}
        </div>
    )
}

export default Table