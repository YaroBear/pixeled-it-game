import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-join-session',
  templateUrl: './join-session.component.html',
  styles: [
  ]
})
export class JoinSessionComponent implements OnInit {
  sessionFormGroup = new FormGroup({
    sessionId: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
  });

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.sessionFormGroup.patchValue({ sessionId: id });
      this.sessionFormGroup.get('sessionId')?.disable();
    }
  }

}
