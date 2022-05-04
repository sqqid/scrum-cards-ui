import {combineLatestWith, map, mergeMap, of, zip} from "rxjs";
import scrumCardsApi from "../../services/srum-cards-api";

interface IAddRoomClicked {
    clientId: string;
    clientName: string;
    roomId: string
}

const modalActions = {

    addRoomClicked: (clientName: string, observer: { next: (data: IAddRoomClicked) => void }) => {
        of(clientName).pipe(
            combineLatestWith(scrumCardsApi.createRoom()),
            mergeMap(([clientName, roomId]: string[]) => {
                return zip(of(roomId), of(clientName), scrumCardsApi.registerClient(roomId, clientName))
            }),
            map(([roomId, clientName, clientId]) => {
                return {roomId, clientName, clientId}
            })
        ).subscribe(observer)
    }

}

export {modalActions}
export type { IAddRoomClicked };

