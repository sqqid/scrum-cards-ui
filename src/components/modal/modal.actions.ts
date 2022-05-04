import {combineLatestWith, map, mergeMap, of, zip} from "rxjs";
import scrumCardsApi from "../../services/srum-cards-api";
import {IClient} from "../contexts/client-context";

const modalActions = {

    addRoomClicked:(clientName: string, clientContext: IClient) => {
        of(clientName).pipe(
            combineLatestWith(scrumCardsApi.createRoom()),
            mergeMap(([clientName, roomId]: string[]) => {
                return zip(of(roomId), of(clientName), scrumCardsApi.registerClient(roomId, clientName))
            }),
            map(([roomId, clientName, clientId]) => {
                return {roomId, clientName, clientId}
            })
        ).subscribe(({clientId, clientName, roomId}) => {
            console.log(`${clientId}, ${clientName}, ${roomId}`)
            clientContext.setClient({id: clientId, name: clientName})
        })
    }

}

export default modalActions
