import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NewSessionComponent } from './new-session/new-session.component';
import { LandingComponent } from './landing/landing.component';
import { JoinSessionComponent } from './join-session/join-session.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { WaitingRoomComponent } from './waiting-room/waiting-room.component';
import { GameRoomComponent } from './game-room/game-room.component';
import { TimerComponent } from './timer/timer.component';

@NgModule({
  declarations: [
    AppComponent,
    NewSessionComponent,
    LandingComponent,
    JoinSessionComponent,
    WaitingRoomComponent,
    GameRoomComponent,
    TimerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
