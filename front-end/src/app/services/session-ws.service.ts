import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, filter } from 'rxjs';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

export interface UpdateUsersResponse {
  type: "updateUsers";
  users: { name: string; }[];
}

@Injectable({
  providedIn: 'root'
})
export class SessionWsService {

  private subject$: WebSocketSubject<any> | undefined;
  private readonly usersReplaySubject$ = new ReplaySubject<UpdateUsersResponse>();

  constructor() {
  }

  connect(sessionId: number, token: string, name: string) {
    this.subject$ = webSocket('ws://localhost:3000/session/' + sessionId + '/join/' + token);
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
        },
      }
    );
  }

  updateUsers(sessionId: number) {
    this.subject$?.next({ type: 'updateUsers', sessionId: sessionId });
  }

  usersSubject$(): Observable<UpdateUsersResponse> {
    return this.usersReplaySubject$.pipe(
      filter((msg: any) => msg.type === 'updateUsers')
    );
  }

  subject() {
    return this.subject$;
  }
}
