import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStore } from '../services/session.service';
import { Subject, takeUntil } from 'rxjs';
import { SessionWsService, JoinSessionResponse as JoinSessionResponse } from '../services/session-ws.service';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html',
  styles: [
  ]
})
export class WaitingRoomComponent implements OnInit, OnDestroy {

  private readonly _destroyed$ = new Subject<void>();

  users: string[] = [];
  sessionId: number = 0;
  isSessionHost: boolean = false;

  constructor(private route: ActivatedRoute, private sessionWsService: SessionWsService) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.sessionId = Number(id);

    this.sessionWsService.joinSessionSubject$(this.sessionId)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((joinSessionResponse: JoinSessionResponse) => {
        this.users = joinSessionResponse.users.map(u => u.name);
      });

    this.sessionWsService.joinSession(this.sessionId);
    this.setSessionHost();
  }

  ngOnDestroy(): void {
    this._destroyed$.next(undefined);
    this._destroyed$.complete();
  }

  private setSessionHost() {
    const sessionStore: string | null = localStorage.getItem(this.sessionId.toString());
    const sessionStoreObj: SessionStore = JSON.parse(sessionStore!);
    this.isSessionHost = sessionStoreObj.sessionHost;
  }

  startGame() {
    this.sessionWsService.startGame(this.sessionId);
  }

}
