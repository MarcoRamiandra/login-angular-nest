import { Injectable } from '@angular/core';
import { AuthTokens } from '../models';

const TOKEN_KEY = 'auth_tokens';

@Injectable({ providedIn: 'root' })
export class TokenService {

  save(tokens: AuthTokens): void {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  }

  get(): AuthTokens | null {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthTokens;
    } catch {
      this.clear();
      return null;
    }
  }

  clear(): void {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  isExpired(): boolean {
    const tokens = this.get();
    if (!tokens) return true;
    return tokens.expiresAt < Date.now();
  }

  isValid(): boolean {
    const tokens = this.get();
    if (!tokens) return false;
    return !this.isExpired();
  }
}
