import { Component, ViewChild } from '@angular/core';
import { SessionService } from '../services/session.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-session',
  templateUrl: './new-session.component.html',
  styles: [
  ]
})
export class NewSessionComponent {

  @ViewChild("fileInput") fileInput: any;

  uploadPreview: SafeResourceUrl[] = [];

  newSessionFormGroup = new FormGroup({
    pictures: new FormControl(null, [Validators.required]),
    name: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
    timeLimit: new FormControl(15),
  });

  constructor(private sessionService: SessionService, private sanitizer: DomSanitizer, private router: Router) { }

  createSession() {
    const password = this.newSessionFormGroup.get('password')?.value!;
    const name = this.newSessionFormGroup.get('name')?.value!;
    const timeLimit = this.newSessionFormGroup.get('timeLimit')?.value!;
    let sessionId: number;

    this.sessionService.createSession(name, password, timeLimit).pipe(
      switchMap(async (id) => {
        sessionId = id;
        return this.uploadPictures(sessionId, password);
      })
    ).subscribe(() => {
      console.log("Session Created. Pictures uploaded");
      this.router.navigate(['waiting-room', sessionId]);
    });
  }

  reloadPreview() {
    const files = this.fileInput.nativeElement;
    this.uploadPreview = [];
    for (let i = 0; i < files.files.length; i++) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = this.sanitizer.bypassSecurityTrustResourceUrl(<string>event.target?.result);
        this.uploadPreview.push(src);
      };
      reader.readAsDataURL(files.files[i]);
    }
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
