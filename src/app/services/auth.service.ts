import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginDTO, Verify2FaDTO, TokenResponseDTO, UserCreateDTO } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID); 

  private authUrl = 'http://localhost:8081/api/auth';
  private userUrl = 'http://localhost:8081/api/users';

  isAuthenticated = signal<boolean>(this.hasValidToken());
  tempEmailFor2FA = signal<string>('');

  register(dto: UserCreateDTO): Observable<any> {
    return this.http.post(`${this.userUrl}/add`, dto);
  }

  login(dto: LoginDTO): Observable<string> {
    return this.http.post(`${this.authUrl}/login`, dto, { responseType: 'text' }).pipe(
      tap(() => {
        this.tempEmailFor2FA.set(dto.email);
      })
    );
  }

  verify2Fa(code: string): Observable<TokenResponseDTO> {
    const dto: Verify2FaDTO = {
      email: this.tempEmailFor2FA(),
      code: code
    };
    
    return this.http.post<TokenResponseDTO>(`${this.authUrl}/verify-2fa`, dto).pipe(
      tap((response) => {
        this.saveToken(response.token);
        this.isAuthenticated.set(true);
        this.tempEmailFor2FA.set('');
      })
    );
  }

  forgotPassword(email: string): Observable<string> {
    return this.http.post(`${this.authUrl}/forgot-password`, { email }, { responseType: 'text' });
  }

  resetPassword(token: string, newPassword: string): Observable<string> {
    return this.http.post(`${this.authUrl}/reset-password`, { token, newPassword }, { responseType: 'text' });
  }

  logout(): void {
    this.http.post(`${this.authUrl}/logout`, {}, { responseType: 'text' }).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }


  private saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('jwt_token', token);
    }
  }

  private clearSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt_token');
    }
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('jwt_token');
    }
    return null; 
  }

  private hasValidToken(): boolean {
    return !!this.getToken();
  }
}