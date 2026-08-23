import { from, Observable } from "rxjs";
import conf from "../constants/config";
import { httpProtocol, resolveOrigin } from "./api-url";

enum REQUEST_METHOD {
  PUT = "PUT",
  GET = "GET",
  DELETE = "DELETE",
}

class ScrumCardsApi {
  private readonly apiUrl: string;

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

  openEventStream(roomId: string, clientId: string): Observable<any> {
    return new Observable<any>((observer) => {
      const eventSource = new EventSource(
        `${this.getApiOrigin()}/rooms/${roomId}/clients/${clientId}/event/`
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

  private getApiOrigin(): string {
    return resolveOrigin(this.apiUrl, httpProtocol(window.location.protocol));
  }

  private getObservable(endpoint: string, method: REQUEST_METHOD): Observable<any> {
    const url = `${this.getApiOrigin()}/${endpoint}`;
    return ScrumCardsApi.fetchData(url, method);
  }

  private static fetchData(url: string, method: REQUEST_METHOD) {
    return from(
      fetch(url, {
        method: method,
        headers: { "Content-type": "application/json; charset=UTF-8" },
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || `HTTP ${res.status}`);
        }
        return data;
      })
    );
  }
}

const scrumCardsApi = new ScrumCardsApi();
export default scrumCardsApi;
