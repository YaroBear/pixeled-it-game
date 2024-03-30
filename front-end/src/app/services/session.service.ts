import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private httpClient: HttpClient) { }

  createSession(password: string): Observable<number> {
    const body = {
      password: password
    };

    return this.httpClient.post<number>('http://localhost:3000/session', body, jsonContentTypeHeaders);
  }

  uploadPictures(sessionId: number, formData: FormData): Observable<number[]> {
    return this.httpClient.post<number[]>(`http://localhost:3000/session/${sessionId}/pictures`, formData);
  }
}
