import {from, Observable, Subject} from "rxjs";
import {webSocket, WebSocketSubject} from "rxjs/webSocket";

enum REQUEST_METHOD {
    PUT = 'PUT',
    GET = 'GET'
}

class SrumCardsApi {

    private readonly apiUrl: string
    private stream: WebSocketSubject<any> | undefined

    constructor() {
        this.apiUrl = `http://${process.env.REACT_APP_SCRUM_CARDS_ENDPOING}/api/v1`
    }

    createRoom(): Observable<string> {
        return this.getObservable('rooms', REQUEST_METHOD.PUT)
    }

    registerClient(roomId: string, name: string): Observable<string> {
        return this.getObservable(`rooms/${roomId}/clients/${name}`, REQUEST_METHOD.PUT)
    }

    addScore(roomId: string, clientId: string, score: number): Observable<string> {
        return this.getObservable(`rooms/${roomId}/clients/${clientId}/score/${score}`, REQUEST_METHOD.PUT)
    }

    pick(roomId: string): Observable<null> {
        return this.getObservable(`rooms/${roomId}/pick`, REQUEST_METHOD.GET)
    }

    reveal(roomId: string): Observable<null> {
        return this.getObservable(`rooms/${roomId}/reveal`, REQUEST_METHOD.GET)
    }

    openStrem(roomId: string, clien_id: string): WebSocketSubject<any> {
        if (!this.stream) {
            this.stream = webSocket(`ws//${this.apiUrl}/rooms/${roomId}/clients/${clien_id}/ws`)
        }
        return this.stream
    }

    private getObservable(endpint: string, method: REQUEST_METHOD): Observable<any> {
        const url = `${this.apiUrl}/${endpint}`
        return this.fetchData(url, method)
    }

    private fetchData(url: string, method: REQUEST_METHOD) {
        return from(fetch(url, {
            method: method,
            headers: {'Content-type': 'application/json; charset=UTF-8'}
        })
            .then((res) => res.json())
            .then((data) => data))
    }

}

const scrumCardsApi = new SrumCardsApi()
export default scrumCardsApi