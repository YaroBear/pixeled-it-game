import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject, Subject, map, switchMap, tap } from 'rxjs';
import { SessionWsService } from './session-ws.service';

export interface SessionStore {
  name: string;
  sessionHost: boolean;
  token: string;
  userSessionId: number;
};

interface AuthenticateResponse {
  token: string;
  userSessionId: number;
}

const jsonContentTypeHeaders = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
};

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private httpClient: HttpClient, private sessionWsService: SessionWsService) { }

  createSession(name: string, password: string, timeLimit: number): Observable<number> {
    const body = {
      password: password,
      timeLimit: timeLimit
    };

    let sessionId: number;

    return this.httpClient.post<number>('http://localhost:3000/session', body, jsonContentTypeHeaders)
      .pipe(
        switchMap((responseSessionId) => {
          sessionId = responseSessionId;
          return this.joinSession(sessionId, password, name, true);
        }),
        map(() => sessionId)
      );
  }

  joinSession(sessionId: number, password: string, name: string, isSessionHost: boolean = false): Observable<AuthenticateResponse> {
    const body = {
      password: password,
      name: name
    };

    return this.httpClient.post<AuthenticateResponse>(`http://localhost:3000/session/${sessionId}/authenticate`, body, jsonContentTypeHeaders)
      .pipe(
        tap((authResponse: AuthenticateResponse) => {
          this.sessionWsService.connect(sessionId, authResponse.token, name);
          const sessionStore: SessionStore = {
            "name": name,
            "sessionHost": isSessionHost,
            "token": authResponse.token,
            "userSessionId": authResponse.userSessionId,
          };
          localStorage.setItem(String(sessionId), JSON.stringify(sessionStore));
        })
      );
  }

  uploadPictures(sessionId: number, formData: FormData): Observable<number[]> {
    return this.httpClient.post<number[]>(`http://localhost:3000/session/${sessionId}/pictures`, formData);
  }
}
