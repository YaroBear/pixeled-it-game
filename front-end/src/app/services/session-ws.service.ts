import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, ReplaySubject, filter } from 'rxjs';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

export type joinSessionType = 'joinSession';
export type startGameType = 'startGame';
export type endGameType = 'endGame';

export interface JoinSessionResponse {
  type: joinSessionType;
  sessionId: number;
  users: { name: string; }[];
}

export interface StartGameResponse {
  type: startGameType;
  sessionId: number;
  endTime: Date;
}

export interface EndGameResponse {
  type: endGameType;
  sessionId: number;
}

@Injectable({
  providedIn: 'root'
})
export class SessionWsService {

  subject$: WebSocketSubject<any> | undefined;
  replaySubject$: ReplaySubject<any> = new ReplaySubject<any>();
  connected: boolean = false;

  constructor(private router: Router) {
  }

  connect(sessionId: number, token: string, name: string) {
    this.subject$ = webSocket('ws://localhost:3000/session/' + sessionId + '/join/' + token);
    this.connected = true;
    this.subject$.subscribe(
      {
        complete: () => console.log('complete'),
        error: (err) => console.error(err),
        next: (msg: any) => {
          this.replaySubject$.next(msg);
          if (msg.type === 'endGame') {
            // this.router.navigate(['game-over', sessionId]);
          }
          if (msg.type === 'startGame') {
            this.router.navigate(['game-room', sessionId]);
          }
          console.log('message received: ' + JSON.stringify(msg));
        }
      }
    );
  }

  joinSession(sessionId: number) {
    this.subject$?.next({ type: 'joinSession', sessionId: sessionId });
  }

  startGame(sessionId: number) {
    this.subject$?.next({ type: 'startGame', sessionId: sessionId });
  }

  joinSessionSubject$(sessionId: number): Observable<JoinSessionResponse> {
    return this.subject$!.pipe(
      filter((msg: any) => msg.type === 'joinSession' && msg.sessionId === sessionId)
    );
  }

  startGameSubject$(sessionId: number): Observable<StartGameResponse> {
    return this.replaySubject$!.pipe(
      filter((msg: any) => msg.type === 'startGame' && msg.sessionId === sessionId)
    );
  }

  endGameSubject$(sessionId: number): Observable<EndGameResponse> {
    return this.subject$!.pipe(
      filter((msg: any) => msg.type === 'endGame' && msg.sessionId === sessionId)
    );
  }
}
