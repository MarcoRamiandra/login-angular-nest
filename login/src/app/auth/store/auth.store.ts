import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthError, AuthStatus, AuthTokens, User } from '../models';
import { LoginCredentials } from '../models';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

// --- State ---
interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  status: AuthStatus;
  error: AuthError | null;
  sessionExpired: boolean;   // ← ajouter
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  status: 'idle',
  error: null,
  sessionExpired: false,     // ← ajouter
};

// --- Store ---
export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ user, tokens, status, sessionExpired }) => ({
    isAuthenticated: computed(() => !!user() && !!tokens()),
    isLoading: computed(() => status() === 'loading'),
    hasError: computed(() => status() === 'error'),
    userRole: computed(() => user()?.role ?? null),
    accessToken: computed(() => tokens()?.accessToken ?? null),
    isSessionExpired: computed(() => sessionExpired()),
  })),

  withMethods((
    store,
    authService = inject(AuthService),
    tokenService = inject(TokenService)
  ) => ({

    login: rxMethod<LoginCredentials>(
      pipe(
        // 1. on passe en loading dès le départ
        tap(() => patchState(store, { status: 'loading', error: null })),

        // 2. on appelle le service
        switchMap(credentials =>
          authService.login(credentials).pipe(
            tapResponse({
              next: ({ tokens, user }) => {
                tokenService.save(tokens); // ← ajouter cette ligne
                patchState(store, {
                  user,
                  tokens,
                  status: 'success',
                  error: null,
                });
              },
              error: (err: unknown) => {
                const authError = err instanceof HttpErrorResponse
                  ? (err.error as AuthError)
                  : (err as AuthError);
                patchState(store, {
                  status: 'error',
                  error: authError,
                });
              },
            })
          )
        )
      )
    ),

    logout(): void {
      tokenService.clear();
      patchState(store, initialState); // initialState a sessionExpired: false
    },

    restoreSession(): void {
      const tokens = tokenService.get();

      // cas 1 — rien dans le storage
      if (!tokens) {
        patchState(store, { status: 'idle' });
        return;
      }

      // cas 2 — token valide → on récupère le profil
      if (tokenService.isValid()) {
        patchState(store, { status: 'loading' });

        authService.getProfile(tokens.accessToken).subscribe({
          next: (user) => {
            patchState(store, {
              user,
              tokens,
              status: 'success',
              error: null,
            });
          },
          error: () => {
            tokenService.clear();
            patchState(store, initialState);
          },
        });

        return;
      }

      // cas 3 — token expiré → on tente un refresh
      patchState(store, { status: 'loading' });

      authService.refreshToken(tokens.refreshToken).subscribe({
        next: (newTokens) => {
          tokenService.save(newTokens);

          authService.getProfile(newTokens.accessToken).subscribe({
            next: (user) => {
              patchState(store, {
                user,
                tokens: newTokens,
                status: 'success',
                error: null,
              });
            },
            error: () => {
              tokenService.clear();
              patchState(store, initialState);
            },
          });
        },
        error: () => {
          tokenService.clear();
          patchState(store, initialState);
        },
      });
    },

    expireSession(): void {
      tokenService.clear();
      patchState(store, {
        ...initialState,
        sessionExpired: true,   // ← seule différence avec logout()
      });
    },
  }))
);
