import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '../services/session.service';
import { Subject, takeUntil } from 'rxjs';
import { SessionWsService, UpdateUsersResponse } from '../services/session-ws.service';

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

  constructor(private route: ActivatedRoute, private sessionService: SessionService, private sessionWsService: SessionWsService) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.sessionId = Number(id);

    this.sessionService.sessionHostMapReplaySubject
      .pipe(takeUntil(this._destroyed$))
      .subscribe((sessionHostMap) => {
        this.isSessionHost = sessionHostMap.get(this.sessionId) === true;
      });

    this.sessionWsService.usersSubject$()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((updatedUsers: UpdateUsersResponse) => {
        this.users = updatedUsers.users.map(u => u.name);
      });
  }

  ngOnDestroy(): void {
    this._destroyed$.next(undefined);
    this._destroyed$.complete();
  }

  startGame() {

  }

}
