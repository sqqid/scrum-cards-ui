import { Subscription } from "rxjs";
import scrumCardsApi from "../../services/scrum-cards-api";

interface IRoomState {
  state: string;
  clients: IRoomClient[];
}

interface IRoomClient {
  client_id: string;
  client_name: string;
  score: string;
  selected: boolean;
}

const contentActions = {
  openStream: (
    roomId: string,
    clientId: string,
    observer: { next: (data: string) => void }
  ): Subscription => {
    return scrumCardsApi.openEventStrem(roomId, clientId).subscribe(observer);
    // scrumCardsApi.openEventStrem(roomId, clientId)
    //   .subscribe(observer)
    // .pipe(
    //   catchError(error => { throw error }),
    //   retry({ delay: 5000 })
    // )
  },

  // openStream: (roomId: string, clientId: string, observer: { next: (data: string) => void }) => {
  //   scrumCardsApi.openStrem(roomId, clientId)
  //     .pipe(
  //       catchError(error => { throw error }),
  //       retry({ delay: 5000 })
  //     )
  //     .subscribe(observer)
  // },

  reveal: (roomId: string) => {
    scrumCardsApi.reveal(roomId).subscribe(() => null);
  },
  newVoting: (roomId: string) => {
    scrumCardsApi.pick(roomId).subscribe(() => null);
  },
};

export { contentActions };
export type { IRoomState, IRoomClient };
