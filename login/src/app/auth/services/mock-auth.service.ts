import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { AuthTokens, AuthError, LoginCredentials, User } from '../models';

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@app.com': {
    password: '123456',
    user: { id: 'u1', email: 'admin@app.com', role: 'admin' },
  },
  'user@app.com': {
    password: '123456',
    user: { id: 'u2', email: 'user@app.com', role: 'user' },
  },
};

const FAKE_DELAY = 800;

@Injectable({ providedIn: 'root' })
export class MockAuthService {

  login(credentials: LoginCredentials): Observable<{ tokens: AuthTokens; user: User }> {
    const match = MOCK_USERS[credentials.email];

    if (!match || match.password !== credentials.password) {
      const error: AuthError = {
        code: 'invalid_credentials',
        message: 'Email or password is incorrect.',
      };
      return throwError(() => error).pipe(delay(FAKE_DELAY));
    }

    return of({
      tokens: this.generateTokens(match.user.id),
      user: match.user,
    }).pipe(delay(FAKE_DELAY));
  }

  refreshToken(currentRefreshToken: string): Observable<AuthTokens> {
    const userId = currentRefreshToken.replace('refresh_', '');
    const userExists = Object.values(MOCK_USERS).some(m => m.user.id === userId);

    if (!userExists) {
      const error: AuthError = {
        code: 'session_expired',
        message: 'Session expired, please reconnect.',
      };
      return throwError(() => error).pipe(delay(FAKE_DELAY));
    }

    return of(this.generateTokens(userId)).pipe(delay(FAKE_DELAY));
  }

  getProfile(accessToken: string): Observable<User> {
    const userId = accessToken.replace('token_', '');
    const match = Object.values(MOCK_USERS).find(m => m.user.id === userId);

    if (!match) {
      const error: AuthError = {
        code: 'session_expired',
        message: 'Session expired, please reconnect.',
      };
      return throwError(() => error).pipe(delay(FAKE_DELAY));
    }

    return of(match.user).pipe(delay(FAKE_DELAY));
  }

  private generateTokens(userId: string): AuthTokens {
    return {
      accessToken: `token_${userId}`,
      refreshToken: `refresh_${userId}`,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };
  }
}
