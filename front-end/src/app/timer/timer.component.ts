import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styles: [
  ]
})
export class TimerComponent implements OnInit {

  @Input()
  minutes: number = 0;

  minutesLeft: number = 0;
  secondsLeft: number = 0;

  @Output()
  timeOver: EventEmitter<boolean> = new EventEmitter<boolean>();

  private intervalId: any;

  constructor() {
  }

  ngOnInit(): void {
    this.startTimer();
  }

  private startTimer() {
    this.minutesLeft = this.minutes;
    this.secondsLeft = 0;
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

  private syncTime() {

  }

}
