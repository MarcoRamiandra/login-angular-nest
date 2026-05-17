export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Timestamp in milliseconds
}
