import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styles: [
  ]
})
export class TimerComponent implements OnInit {

  @Input()
  set endTime(value: Date) {
    if (value) {
      this._endTime = new Date(value);
      this.startTimer();
    }
  }
  _endTime: Date = new Date();

  minutesLeft: number = 0;
  secondsLeft: number = 0;

  @Output()
  timeOver: EventEmitter<boolean> = new EventEmitter<boolean>();

  private intervalId: any;

  constructor() {
  }

  ngOnInit(): void {
  }

  private startTimer() {
    const currentDateUtc = new Date(new Date().toUTCString());
    const differenceMs = this._endTime.getTime() - currentDateUtc.getTime();
    this.minutesLeft = Math.floor((differenceMs / 1000) / 60);
    this.secondsLeft = Math.floor((differenceMs / 1000) % 60);
    this.intervalId = setInterval(() => {
      this.secondsLeft--;
      if (this.secondsLeft < 0) {
        this.secondsLeft = 59;
        this.minutesLeft--;
      }
      if (this.minutesLeft == 0 && this.secondsLeft == 0) {
        this.timeOver.emit(true);
        clearInterval(this.intervalId);
      }
    }, 1000);
  }

}
