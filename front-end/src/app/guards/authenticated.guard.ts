import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SessionWsService } from '../services/session-ws.service';
import { SessionStore } from '../services/session.service';

export const authenticatedGuard: CanActivateFn = (route, state) => {

  const sessionWsService = inject(SessionWsService);

  const sessionId = route.params['id'];
  const sessionStore: string | null = localStorage.getItem(sessionId);
  if (!sessionStore) {
    const router = inject(Router);
    return router.parseUrl(`/join-session/${sessionId}`);
  }

  const sessionStoreObj: SessionStore = JSON.parse(sessionStore);

  if (!sessionWsService.connected) {
    sessionWsService.connect(Number(sessionId), sessionStoreObj.token, sessionStoreObj.name);
  }

  return true;
};
