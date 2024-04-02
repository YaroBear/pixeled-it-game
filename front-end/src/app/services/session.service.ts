import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject, Subject, map, switchMap, tap } from 'rxjs';
import { SessionWsService } from './session-ws.service';

export interface SessionStore {
  name: string;
  sessionHost: boolean;
  token: string;
};

interface TokenResponse {
  token: string;
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

  sessionStoreMap: Map<number, SessionStore> = new Map();
  sessionStoreReplaySubject = new ReplaySubject<Map<number, SessionStore>>();

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

  joinSession(sessionId: number, password: string, name: string, isSessionHost: boolean = false): Observable<TokenResponse> {
    const body = {
      password: password,
      name: name
    };

    return this.httpClient.post<TokenResponse>(`http://localhost:3000/session/${sessionId}/join`, body, jsonContentTypeHeaders)
      .pipe(
        tap((tokenResponse: TokenResponse) => {
          this.sessionWsService.connect(sessionId, tokenResponse.token, name);
          const sessionStore: SessionStore = {
            "name": name,
            "sessionHost": isSessionHost,
            "token": tokenResponse.token
          };
          localStorage.setItem(String(sessionId), JSON.stringify(sessionStore));
          this.sessionStoreMap.set(sessionId, sessionStore);
          this.sessionStoreReplaySubject.next(this.sessionStoreMap);
        })
      );
  }

  uploadPictures(sessionId: number, formData: FormData): Observable<number[]> {
    return this.httpClient.post<number[]>(`http://localhost:3000/session/${sessionId}/pictures`, formData);
  }
}
