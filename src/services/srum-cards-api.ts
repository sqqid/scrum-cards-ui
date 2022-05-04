import {Observable, Subject} from "rxjs";
import {webSocket, WebSocketSubject} from "rxjs/webSocket";

enum REQUEST_METHOD {
    PUT = 'PUT',
    GET = 'GET'
}

class SrumCardsApi {

    private readonly apiUrl: string
    private stream: WebSocketSubject<any> | undefined

    constructor() {
        this.apiUrl = `${process.env.REACT_APP_SCRUM_CARDS_ENDPOING}/api/v1`
    }

    createRoom(): Observable<string> {
        return this.getObservable('rooms', REQUEST_METHOD.PUT)
    }

    registerClient(room_id: string, name: string): Observable<string> {
        return this.getObservable(`rooms/${room_id}/clients/${name}`, REQUEST_METHOD.PUT)
    }

    addScore(room_id: string, client_id: string, score: number): Observable<string> {
        return this.getObservable(`rooms/${room_id}/clients/${client_id}/score/${score}`, REQUEST_METHOD.PUT)
    }

    pick(room_id: string): Observable<null> {
        return this.getObservable(`rooms/${room_id}/pick`, REQUEST_METHOD.GET)
    }

    reveal(room_id: string): Observable<null> {
        return this.getObservable(`rooms/${room_id}/reveal`, REQUEST_METHOD.GET)
    }

    openStrem(room_id: string, clien_id: string): WebSocketSubject<any> {
        if (!this.stream) {
            this.stream = webSocket(`ws//${this.apiUrl}/rooms/${room_id}/clients/${clien_id}/ws`)
        }
        return this.stream
    }

    private getObservable(endpint: string, method: REQUEST_METHOD): Observable<any> {
        const url = `${this.apiUrl}/${endpint}`
        const subject = new Subject<string>()
        this.fetchData(url, method, subject)
        return subject;
    }

    private fetchData(url: string, method: REQUEST_METHOD, observable: Subject<any>) {
        fetch(url, {
            method: method,
            headers: {'Content-type': 'application/json; charset=UTF-8'}
        })
            .then((res) => res.json())
            .then((data) => observable.next(data))
    }

}

export default SrumCardsApi