import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthTokens, User } from '../models';
import { LoginCredentials } from '../models';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/auth`;

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private readonly http: HttpClient) { }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/login`, credentials);
  }

  refreshToken(currentRefreshToken: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(
      `${API_URL}/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${currentRefreshToken}`
        }
      }
    );
  }

  getProfile(accessToken: string): Observable<User> {
    return this.http.get<User>(
      `${API_URL}/profile`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
  }

  logout(accessToken: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${API_URL}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
  }
}
