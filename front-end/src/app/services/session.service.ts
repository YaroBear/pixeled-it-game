import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject, Subject, tap } from 'rxjs';

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

  sessionHostMap: Map<number, boolean> = new Map();
  sessionHostMapReplaySubject = new ReplaySubject<Map<number, boolean>>();

  constructor(private httpClient: HttpClient) { }

  createSession(password: string): Observable<number> {
    const body = {
      password: password
    };

    return this.httpClient.post<number>('http://localhost:3000/session', body, jsonContentTypeHeaders)
      .pipe(
        tap((sessionId) => {
          this.sessionHostMap.set(sessionId, true);
          this.sessionHostMapReplaySubject.next(this.sessionHostMap);
        })
      );
  }

  uploadPictures(sessionId: number, formData: FormData): Observable<number[]> {
    return this.httpClient.post<number[]>(`http://localhost:3000/session/${sessionId}/pictures`, formData);
  }

  joinSession(sessionId: number, password: string, name: string): Observable<number> {
    const body = {
      password: password,
      name: name
    };

    return this.httpClient.post<number>(`http://localhost:3000/session/${sessionId}/join`, body, jsonContentTypeHeaders);
  }
}
