import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  BackendConfig,
  BenchmarkBatchResult,
  JwtAuthService,
  TestUser
} from '../../services/jwt.auth.service';

@Component({
  selector: 'app-login',
  imports: [DecimalPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly backends: BackendConfig[];
  readonly batchSizes: number[] = [1, 100, 1000, 10000];

  // Existing backend datasets currently have these seed users.
  private readonly seedUsers: TestUser[] = [
    { email: 'user10@test.com', password: 'test' },
    { email: 'user25@test.com', password: 'test' },
    { email: 'user50@test.com', password: 'test' },
    { email: 'user100@test.com', password: 'test' },
    { email: 'user200@test.com', password: 'test' }
  ];

  private readonly runningState = new Map<string, boolean>();
  private readonly results = new Map<string, BenchmarkBatchResult>();

  constructor(
    private readonly jwtAuthService: JwtAuthService
  ) {
    this.backends = this.jwtAuthService.getBackends();
  }

  async runBenchmark(backendId: string, userCount: number): Promise<void> {
    const key = this.getKey(backendId, userCount);
    this.runningState.set(key, true);

    try {
      const users = this.buildRandomUsers(userCount);
      const result = await this.jwtAuthService.benchmarkBackend(backendId, users);
      this.results.set(key, result);
    } finally {
      this.runningState.set(key, false);
    }
  }

  isRunning(backendId: string, userCount: number): boolean {
    return this.runningState.get(this.getKey(backendId, userCount)) ?? false;
  }

  isBackendRunning(backendId: string): boolean {
    return this.batchSizes.some((size) => this.isRunning(backendId, size));
  }

  getResult(backendId: string, userCount: number): BenchmarkBatchResult | null {
    return this.results.get(this.getKey(backendId, userCount)) ?? null;
  }

  buildRandomUsers(userCount: number): TestUser[] {
    const generated: TestUser[] = [];

    for (let i = 0; i < userCount; i += 1) {
      const randomIndex = Math.floor(Math.random() * this.seedUsers.length);
      generated.push(this.seedUsers[randomIndex]);
    }

    return generated;
  }

  private getKey(backendId: string, userCount: number): string {
    return `${backendId}-${userCount}`;
  }

}
