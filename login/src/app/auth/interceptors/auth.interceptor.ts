import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError, filter, take, switchMap, catchError } from 'rxjs';
import { AuthStore } from '../store/auth.store';
import { MockAuthService } from '../services/mock-auth.service';
import { TokenService } from '../services/token.service';

// --- verrou anti-cascade ---
// ces variables vivent en dehors de la fonction
// elles sont partagées entre toutes les requêtes simultanées
let isRefreshing = false;
let refreshSubject = new BehaviorSubject<string | null>(null);

// routes publiques — pas de token nécessaire
const PUBLIC_URLS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
];

function isPublicUrl(url: string): boolean {
  return PUBLIC_URLS.some(pub => url.includes(pub));
}

// ajoute le header Authorization sur la requête
function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authStore = inject(AuthStore);
  const authService = inject(MockAuthService);
  const tokenService = inject(TokenService);

  // routes publiques → on laisse passer
  if (isPublicUrl(req.url)) {
    return next(req);
  }

  // on injecte le token si présent
  const token = authStore.accessToken();
  const authReq = token ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError((error) => {

      // si ce n'est pas un 401 → on laisse l'erreur remonter normalement
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      // --- gestion du 401 ---

      // cas 1 — un refresh est déjà en cours
      // on met cette requête en attente jusqu'à ce que le nouveau token arrive
      if (isRefreshing) {
        return refreshSubject.pipe(
          filter(t => t !== null),   // on attend que le token soit émis
          take(1),                   // on ne prend que la première émission
          switchMap(newToken => next(addToken(req, newToken!)))
        );
      }

      // cas 2 — on est le premier à déclencher le refresh
      isRefreshing = true;
      refreshSubject.next(null); // on bloque les autres requêtes

      const tokens = tokenService.get();

      // pas de refresh token → logout direct
      if (!tokens?.refreshToken) {
        isRefreshing = false;
        authStore.logout();
        return throwError(() => error);
      }

      // on tente le refresh
      return authService.refreshToken(tokens.refreshToken).pipe(
        switchMap((newTokens) => {
          // refresh réussi
          isRefreshing = false;
          tokenService.save(newTokens);

          // on émet le nouveau token → les requêtes en attente se débloquent
          refreshSubject.next(newTokens.accessToken);

          // on rejoue la requête originale avec le nouveau token
          return next(addToken(req, newTokens.accessToken));
        }),
        catchError((refreshError) => {
          // refresh échoué → on nettoie tout
          isRefreshing = false;
          refreshSubject.next(null);
          authStore.expireSession();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
