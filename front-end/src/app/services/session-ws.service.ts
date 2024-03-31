import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, filter } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

export interface UpdateUsersResponse {
  type: "updateUsers";
  users: { name: string; }[];
}

@Injectable({
  providedIn: 'root'
})
export class SessionWsService {

  private readonly subject$ = webSocket('ws://localhost:8080');
  private readonly usersReplaySubject$ = new ReplaySubject<UpdateUsersResponse>();

  constructor() {
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

  joinSession(sessionId: number, password: string, name: string) {
    this.subject$.next({ type: 'joinSession', sessionId: sessionId, password: password, name: name });
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
