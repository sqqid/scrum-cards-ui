import { from, Observable } from "rxjs";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import conf from "../constants/config";

enum REQUEST_METHOD {
  PUT = "PUT",
  GET = "GET",
  DELETE = "DELETE",
}

class ScrumCardsApi {
  private readonly apiUrl: string;
  private stream: WebSocketSubject<any> | undefined;

  constructor() {
    this.apiUrl = `${conf.API_URL}`;
  }

  createRoom(): Observable<string> {
    return this.getObservable("rooms/", REQUEST_METHOD.PUT);
  }

  registerClient(roomId: string, name: string): Observable<string> {
    return this.getObservable(`rooms/${roomId}/clients/${name}/`, REQUEST_METHOD.PUT);
  }

  changeClientName(roomId: string, clientId: string, name: string): Observable<string> {
    return this.getObservable(`rooms/${roomId}/clients/${clientId}/${name}/`, REQUEST_METHOD.PUT);
  }

  addScore(roomId: string, clientId: string, score: string): Observable<string> {
    score = score === "?" ? "%3F" : score;
    return this.getObservable(
      `rooms/${roomId}/clients/${clientId}/score/${score}/`,
      REQUEST_METHOD.PUT
    );
  }

  removeScore(roomId: string, clientId: string): Observable<string> {
    return this.getObservable(`rooms/${roomId}/clients/${clientId}/score/`, REQUEST_METHOD.DELETE);
  }

  pick(roomId: string): Observable<null> {
    return this.getObservable(`rooms/${roomId}/pick/`, REQUEST_METHOD.GET);
  }

  reveal(roomId: string): Observable<null> {
    return this.getObservable(`rooms/${roomId}/reveal/`, REQUEST_METHOD.GET);
  }

  openEventStrem(roomId: string, clientId: string): Observable<any> {
    return new Observable<any>((observer) => {
      const eventSource = new EventSource(
        `http://${this.apiUrl}/rooms/${roomId}/clients/${clientId}/event/`
      );
      eventSource.onmessage = (event) => {
        observer.next(event.data);
      };

      eventSource.onerror = (error) => {
        if (eventSource.readyState === EventSource.CLOSED) {
          observer.complete();
        } else {
          observer.error(error);
        }
      };

      return () => {
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
        }
      };
    });
  }

  openStrem(roomId: string, clientId: string): WebSocketSubject<any> {
    if (!this.stream) {
      this.stream = webSocket(`ws://localhost:8080/api/rooms/${roomId}/clients/${clientId}/ws`);
    }
    return this.stream;
  }

  disconnectStrem() {
    if (this.stream) {
      this.stream.complete();
      this.stream.unsubscribe();
      this.stream = undefined;
    }
  }

  getStream() {
    return this.stream;
  }

  private getObservable(endpint: string, method: REQUEST_METHOD): Observable<any> {
    const url = `http://${this.apiUrl}/${endpint}`;
    return ScrumCardsApi.fetchData(url, method);
  }

  private static fetchData(url: string, method: REQUEST_METHOD) {
    return from(
      fetch(url, {
        method: method,
        headers: { "Content-type": "application/json; charset=UTF-8" },
      })
        .then((res) => res.json())
        .then((data) => data)
    );
  }
}

const scrumCardsApi = new ScrumCardsApi();
export default scrumCardsApi;
