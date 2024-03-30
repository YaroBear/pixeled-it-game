import { Component, ViewChild } from '@angular/core';
import { SessionService } from '../services/session.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-new-session',
  templateUrl: './new-session.component.html',
  styles: [
  ]
})
export class NewSessionComponent {

  @ViewChild("fileInput") fileInput: any;

  newSessionFormGroup = new FormGroup({
    pictures: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
    gameTime: new FormControl(15),
  });

  constructor(private sessionService: SessionService) { }

  createSession() {
    const password = this.newSessionFormGroup.get('password')?.value!;

    this.sessionService.createSession(password).pipe(
      switchMap(async (sessionId) => this.uploadPictures(sessionId, password))
    ).subscribe(() => {
      console.log("Session Created. Pictures uploaded");
    });
  }

  private uploadPictures(sessionId: number, password: string) {
    const formData = new FormData();
    formData.append("password", password);

    const files = this.fileInput.nativeElement;
    for (let i = 0; i < files.files.length; i++) {
      formData.append("pictures", files.files[i]);
    }

    return this.sessionService.uploadPictures(sessionId, formData).subscribe((pictureIds: number[]) => {
      console.log(`Pictures uploaded with ids: ${pictureIds}`);
    });
  }
}
