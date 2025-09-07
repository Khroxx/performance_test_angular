import { Component } from '@angular/core';
import { Router} from '@angular/router';
import { JwtAuthService } from '../../services/jwt.auth.service';
import { DecimalPipe } from '@angular/common';

interface TestUser {
  email: string,
  password: string,
  values: string[]
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
    { email: 'user10@test.com', password: 'test', values: this.generateValues(10) },
    { email: 'user10@test.com', password: 'test', values: this.generateValues(25) },
    { email: 'user10@test.com', password: 'test', values: this.generateValues(50) },
    { email: 'user10@test.com', password: 'test', values: this.generateValues(100) },
    { email: 'user10@test.com', password: 'test', values: this.generateValues(200) },
  ];

  loginResults: LoginResult[] | null = null;
  loading = false;
  currentUserValues: string[] | null = null;

  constructor(
    private jwtAuthService: JwtAuthService,
    private router: Router
  )
  {}

  generateValues(amount: number): string[] {
    return Array.from({ length: amount }, (_, i) => `value${i + 1}`)
  }

  async login(user: TestUser) {
    this.loading = true;
    this.loginResults = null;
    const results = await this.jwtAuthService.login(user.email, user.password);
    this.loginResults = results;
    localStorage.setItem('user_values', JSON.stringify(user.values));
    this.currentUserValues = user.values;
    // Store all tokens with backend-specific keys
    results.forEach(result => {
      if (result.token) {
        localStorage.setItem(result.backend + 'Token', result.token);
      }
    });
    this.loading = false;
  }

}
