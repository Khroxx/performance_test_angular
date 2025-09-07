import { Component } from '@angular/core';
import { JwtAuthService } from '../../services/jwt.auth.service';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

interface TestUser {
  email: string,
  password: string
}

interface LoginResult {
  backend: string;
  token: string | null;
  timeMs: number;
  error?: any;
}

@Component({
  selector: 'app-login',
  imports: [DecimalPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
 
  users = [
  { email: 'user10@test.com', password: 'test', values: 10 },
  { email: 'user25@test.com', password: 'test', values: 25 },
  { email: 'user50@test.com', password: 'test', values: 50 },
  { email: 'user100@test.com', password: 'test', values: 100 },
  { email: 'user200@test.com', password: 'test', values: 200 },
  ];

  loginResults: LoginResult[] | null = null;
  loading = false;
  currentUserValues: string[] | null = null;

  constructor(
    private jwtAuthService: JwtAuthService,
    private http: HttpClient
  )
  {}

async login(user: TestUser) {
  this.loading = true;
  this.loginResults = null;
  const results = await this.jwtAuthService.login(user.email, user.password);
  this.loginResults = results;
  try {
    const values = await lastValueFrom(
      this.http.get<string[]>('BACKEND_URL/user-values', {
        params: { email: user.email }
      })
    );
    this.currentUserValues = values ?? [];
    localStorage.setItem('user_values', JSON.stringify(this.currentUserValues));
  } catch {
    this.currentUserValues = [];
  }
  results.forEach(result => {
    if (result.token) {
      localStorage.setItem(result.backend + 'Token', result.token);
    }
  });
  this.loading = false;
}

}
