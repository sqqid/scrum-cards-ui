import { map, mergeMap, of, zip } from "rxjs";
import scrumCardsApi from "../../services/scrum-cards-api";

interface IAddRoomClicked {
  clientId: string;
  roomId: string;
}

const modalActions = {
  addRoomClicked: (
    clientName: string,
    observer: { next: (data: IAddRoomClicked) => void; error?: (error: Error) => void }
  ) => {
    scrumCardsApi
      .createRoom()
      .pipe(
        mergeMap((roomId) => {
          return zip(of(roomId), scrumCardsApi.registerClient(roomId, clientName));
        }),
        map(([roomId, clientId]) => {
          scrumCardsApi.disconnectStrem();
          return { roomId, clientId };
        })
      )
      .subscribe({
        next: (data: IAddRoomClicked) => observer.next(data),
        error: (err: Error) => {
          console.error("Failed to create room:", err);
          observer.error?.(err);
        },
      });
  },

  updateUserName: (
    roomId: string,
    client: { name: string; id: string },
    observer: { next: () => void; error?: (error: Error) => void }
  ) => {
    scrumCardsApi.changeClientName(roomId, client.id, client.name).subscribe({
      next: () => observer.next(),
      error: (err: Error) => {
        console.error("Failed to change client name:", err);
        observer.error?.(err);
      },
    });
  },

  registerClient: (
    room_id: string,
    name: string,
    observer: { next: (clientId: string) => void; error?: (error: Error) => void }
  ) => {
    scrumCardsApi.registerClient(room_id, name).subscribe({
      next: (clientId: string) => observer.next(clientId),
      error: (err: Error) => {
        console.error("Failed to register client:", err);
        observer.error?.(err);
      },
    });
  },
};

export { modalActions };
export type { IAddRoomClicked };
