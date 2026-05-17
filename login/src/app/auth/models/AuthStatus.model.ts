export type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'account_locked'
  | 'network_error'
  | 'session_expired'
  | 'unknown';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}
