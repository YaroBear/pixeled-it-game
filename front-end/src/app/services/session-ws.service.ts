import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, filter } from 'rxjs';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

export interface UpdateUsersResponse {
  type: "updateUsers";
  sessionId: number;
  users: { name: string; }[];
}

export interface StartGameResponse {
  type: "startGame";
  sessionId: number;
  endTime: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SessionWsService {

  private subject$: WebSocketSubject<any> | undefined;
  private readonly usersReplaySubject$ = new ReplaySubject<UpdateUsersResponse>();
  private readonly startGameReplaySubject$ = new ReplaySubject<StartGameResponse>();
  connected: boolean = false;

  constructor() {
  }

  connect(sessionId: number, token: string, name: string) {
    this.subject$ = webSocket('ws://localhost:3000/session/' + sessionId + '/join/' + token);
    this.connected = true;
    this.subject$.next({ type: 'joinSession', sessionId: sessionId });
    this.subject$.subscribe(
      {
        complete: () => console.log('complete'),
        error: (err) => console.error(err),
        next: (msg: any) => {
          console.log('message received: ' + JSON.stringify(msg));
          if (msg.type === 'updateUsers') {
            this.usersReplaySubject$.next(msg);
          }
          if (msg.type === 'startGame') {
            this.startGameReplaySubject$.next(msg);
          }
        }
      }
    );
  }

  updateUsers(sessionId: number) {
    this.subject$?.next({ type: 'updateUsers', sessionId: sessionId });
  }

  usersSubject$(sessionId: number): Observable<UpdateUsersResponse> {
    return this.usersReplaySubject$.pipe(
      filter((msg: any) => msg.type === 'updateUsers' && msg.sessionId === sessionId)
    );
  }

  startGameSubject$(sessionId: number): Observable<StartGameResponse> {
    return this.startGameReplaySubject$.pipe(
      filter((msg: any) => msg.type === 'startGame' && msg.sessionId === sessionId)
    );
  }

  subject() {
    return this.subject$;
  }

  startGame(sessionId: number) {
    this.subject$?.next({ type: 'startGame', sessionId: sessionId });
  }
}
