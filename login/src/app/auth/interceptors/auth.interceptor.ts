import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError, filter, take, switchMap, catchError } from 'rxjs';
import { AuthStore } from '../store/auth.store';
import { MockAuthService } from '../services/mock-auth.service';
import { TokenService } from '../services/token.service';

let isRefreshing = false;
let refreshSubject = new BehaviorSubject<string | null>(null);

const PUBLIC_URLS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
];

function isPublicUrl(url: string): boolean {
  return PUBLIC_URLS.some(pub => url.includes(pub));
}

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

  if (isPublicUrl(req.url)) {
    return next(req);
  }

  const token = authStore.accessToken();
  const authReq = token ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError((error) => {

      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      if (isRefreshing) {
        return refreshSubject.pipe(
          filter(t => t !== null),
          take(1),
          switchMap(newToken => next(addToken(req, newToken!)))
        );
      }

      isRefreshing = true;
      refreshSubject.next(null);

      const tokens = tokenService.get();

      if (!tokens?.refreshToken) {
        isRefreshing = false;
        authStore.logout();
        return throwError(() => error);
      }

      return authService.refreshToken(tokens.refreshToken).pipe(
        switchMap((newTokens) => {
          isRefreshing = false;
          tokenService.save(newTokens);

          refreshSubject.next(newTokens.accessToken);

          return next(addToken(req, newTokens.accessToken));
        }),
        catchError((refreshError) => {
          isRefreshing = false;
          refreshSubject.next(null);
          authStore.expireSession();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
