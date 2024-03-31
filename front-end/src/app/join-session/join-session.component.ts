import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SessionWsService } from '../services/session-ws.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-join-session',
  templateUrl: './join-session.component.html',
  styles: [
  ]
})
export class JoinSessionComponent implements OnInit, OnDestroy {

  private readonly _destroyed$ = new Subject<void>();

  error: string = '';

  sessionFormGroup = new FormGroup({
    sessionId: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
    name: new FormControl(null, [Validators.required]),
  });

  constructor(private route: ActivatedRoute, private sessionWsService: SessionWsService, private router: Router) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.sessionFormGroup.patchValue({ sessionId: id });
      this.sessionFormGroup.get('sessionId')?.disable();
    }
  }

  joinSession() {
    const { sessionId, password, name } = this.sessionFormGroup.value;
    this.sessionWsService.subject()
      .pipe(takeUntil(this._destroyed$))
      .subscribe((msg: any) => {
        if (msg.type === 'error') {
          this.error = msg.message;
        }
        this.router.navigate(['waiting-room', sessionId]);
      });
    this.sessionWsService.joinSession(sessionId!, password!, name!);
  }

  ngOnDestroy(): void {
    this._destroyed$.next(undefined);
    this._destroyed$.complete();
  }

}
