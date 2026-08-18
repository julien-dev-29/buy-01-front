import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { TokenStorage } from './token-storage';
import { User } from '../models/user.model';
import { LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorage);
  private userSignal = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.userSignal() === null);

  getToken() {
    return this.tokenStorage.get();
  }

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>('http://localhost:9000/api/auth/login', {
        email,
        password,
      })
      .subscribe((res) => {
        this.tokenStorage.set(res.token);
      });
  }
}
