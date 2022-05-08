import {map, mergeMap, of, zip} from "rxjs";
import scrumCardsApi from "../../services/srum-cards-api";

interface IAddRoomClicked {
    clientId: string;
    roomId: string
}

const modalActions = {

    addRoomClicked: (clientName: string, observer: { next: (data: IAddRoomClicked) => void }) => {
        scrumCardsApi.createRoom().pipe(
            mergeMap((roomId) => {
                return zip(of(roomId), scrumCardsApi.registerClient(roomId, clientName))
            }),
            map(([roomId, clientId]) => {
                scrumCardsApi.disconnect(roomId, clientId)
                return {roomId, clientId}
            })
        ).subscribe(observer)
    },

    updateUserName: (roomId: string, client: { name: string; id: string }, observer: { next: () => void }) => {
        scrumCardsApi.changeClientName(roomId, client.id, client.name)
            .subscribe(observer)
    },

    registerClient: (room_id: string, name: string, observer: { next: (clientId: string) => void }) => {
        scrumCardsApi.registerClient(room_id, name)
            .subscribe(observer)
    },
}

export {modalActions}
export type {IAddRoomClicked};