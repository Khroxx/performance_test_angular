import { Component } from '@angular/core';
import { JwtAuthService } from '../../services/jwt.auth.service';
import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

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
  imports: [DecimalPipe, KeyValuePipe],
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
  currentUser: Record<string, any> | null = null;
  currentUsers: Record<string, any>[] = [];

  constructor(
    private jwtAuthService: JwtAuthService,
    private http: HttpClient
  )
  {}

async fetchUserData(user: TestUser, backend: string): Promise<void> {
  try {
    const GoToken = localStorage.getItem('GoToken');
    const headers = GoToken
      ? new HttpHeaders({ Authorization: `${GoToken}` })
      : undefined;
    const userData = await lastValueFrom(
      this.http.get<Record<string, any>>('http://localhost:8081/api/userinfo', {
        headers
      })
    );
    this.currentUsers.push(userData);
    localStorage.setItem('user_info', JSON.stringify(this.currentUsers));
  } catch {
    console.error("Could not GET user data")
  }
}

async login(user: TestUser) {
  this.loading = true;
  this.loginResults = null;
  const results = await this.jwtAuthService.login(user.email, user.password);
  this.loginResults = results;
  results.forEach(async result => {
    if (result.token) {
      localStorage.setItem(result.backend + 'Token', result.token);
      await this.fetchUserData(user, result.backend); // Fetch user data for each backend
    }
  });
  this.loading = false;
}

}
