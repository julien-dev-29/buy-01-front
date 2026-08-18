import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAnchor } from '@angular/material/button';
import { LoginRequest } from '../../../core/models/auth.model';
import { form, FormField } from '@angular/forms/signals';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatAnchor, FormField],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected loginModel = signal<LoginRequest>({
    email: '',
    password: '',
  });
  protected loginForm = form(this.loginModel);

  onSubmit(e: Event): void {
    e.preventDefault();
    const { email, password } = this.loginModel();
    this.auth.login(email, password);
    this.router.navigate([this.auth.getToken() !== null ? 'user' : 'register']);
  }
}
