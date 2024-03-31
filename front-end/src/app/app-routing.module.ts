import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewSessionComponent } from './new-session/new-session.component';
import { LandingComponent } from './landing/landing.component';
import { JoinSessionComponent } from './join-session/join-session.component';
import { WaitingRoomComponent } from './waiting-room/waiting-room.component';

const routes: Routes = [
  {
    component: LandingComponent, path: '', pathMatch: 'full'
  },
  {
    component: NewSessionComponent, path: 'new-session'
  },
  {
    component: JoinSessionComponent, path: 'join-session'
  },
  {
    component: JoinSessionComponent, path: 'join-session/:id'
  },
  {
    component: WaitingRoomComponent, path: 'waiting-room/:id'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
