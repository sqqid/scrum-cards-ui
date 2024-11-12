import scrumCardsApi from "../../../../services/scrum-cards-api";

const pickerCardActions = {

    pickCard: (roomId: string, clientId: string, score: string) => {
        scrumCardsApi.addScore(roomId, clientId, score)
            .subscribe(() => null)
    },

    removeCard: (roomId: string, clientId: string) => {
        scrumCardsApi.removeScore(roomId, clientId)
            .subscribe(() => null)
    },

}

export {pickerCardActions}
