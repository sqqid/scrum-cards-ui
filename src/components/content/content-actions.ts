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
    observer: { next: (data: string) => void; error?: (error: Error) => void }
  ): Subscription => {
    return scrumCardsApi.openEventStream(roomId, clientId).subscribe({
      next: (data: string) => observer.next(data),
      error: (err: Error) => {
        console.error("Failed to open room event stream:", err);
        observer.error?.(err);
      },
    });
  },

  reveal: (roomId: string, onError?: (error: Error) => void) => {
    scrumCardsApi.reveal(roomId).subscribe({
      next: () => null,
      error: (err: Error) => {
        console.error("Failed to reveal cards:", err);
        onError?.(err);
      },
    });
  },
  newVoting: (roomId: string, onError?: (error: Error) => void) => {
    scrumCardsApi.pick(roomId).subscribe({
      next: () => null,
      error: (err: Error) => {
        console.error("Failed to start new voting:", err);
        onError?.(err);
      },
    });
  },
};

export { contentActions };
export type { IRoomState, IRoomClient };
