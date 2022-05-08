import scrumCardsApi from "../../services/srum-cards-api";

interface IRoomState {
    state: string,
    clients: IRoomClient[]
}

interface IRoomClient {
    client_id: string,
    client_name: string,
    score: string,
    selected: boolean
}

const contentActions = {

    openStream: (roomId: string, clientId: string, observer: { next: (data: string) => void }) => {
        scrumCardsApi.openStrem(roomId, clientId)
            .subscribe(observer)
    },

    reveal: (roomId: string) => {
        scrumCardsApi.reveal(roomId)
            .subscribe(() => null)
    },

    newVoting: (roomId: string) => {
        scrumCardsApi.pick(roomId)
            .subscribe(() => null)
    }
}

export {contentActions}
export type {IRoomState, IRoomClient}
