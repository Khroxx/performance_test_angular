import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

export interface TestUser {
  email: string;
  password: string;
}

export interface BackendConfig {
  id: string;
  name: string;
  loginUrl: string;
  userInfoUrl: string;
  tokenHeader: string;
  sendAuthorizationBearer?: boolean;
}

export interface BenchmarkBatchResult {
  backendId: string;
  backendName: string;
  userCount: number;
  totalTimeMs: number;
  successCount: number;
  failureCount: number;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JwtAuthService {

  private readonly backends: BackendConfig[] = [
    {
      id: 'go',
      name: 'Go',
      loginUrl: 'http://localhost:8081/api/login',
      userInfoUrl: 'http://localhost:8081/api/userinfo',
      tokenHeader: 'GoToken',
      sendAuthorizationBearer: true
    },
    {
      id: 'spring',
      name: 'Spring Boot',
      loginUrl: 'http://localhost:8082/api/login',
      userInfoUrl: 'http://localhost:8082/api/userinfo',
      tokenHeader: 'SpringToken',
      sendAuthorizationBearer: true
    },
    {
      id: 'django-ninja',
      name: 'Django Ninja',
      loginUrl: 'http://localhost:8080/api/login',
      userInfoUrl: 'http://localhost:8080/api/userinfo',
      tokenHeader: 'DjangoToken',
      sendAuthorizationBearer: true
    }
  ];

  constructor(
    private http: HttpClient
  ) { }

  getBackends(): BackendConfig[] {
    return this.backends;
  }

  async benchmarkBackend(backendId: string, users: TestUser[]): Promise<BenchmarkBatchResult> {
    const backend = this.backends.find((entry) => entry.id === backendId);
    if (!backend) {
      return {
        backendId,
        backendName: backendId,
        userCount: users.length,
        totalTimeMs: 0,
        successCount: 0,
        failureCount: users.length,
        status: 'failed',
        errorMessage: 'Backend config not found'
      };
    }

    const start = performance.now();
    const outcomes = await Promise.all(users.map((user) => this.runLoginFlow(backend, user)));
    const totalTimeMs = performance.now() - start;

    const successCount = outcomes.filter((ok) => ok).length;
    const failureCount = users.length - successCount;

    let status: 'success' | 'partial' | 'failed' = 'success';
    if (successCount === 0) {
      status = 'failed';
    } else if (failureCount > 0) {
      status = 'partial';
    }

    return {
      backendId: backend.id,
      backendName: backend.name,
      userCount: users.length,
      totalTimeMs,
      successCount,
      failureCount,
      status
    };
  }

  private async runLoginFlow(backend: BackendConfig, user: TestUser): Promise<boolean> {
    try {
      const loginResponse = await lastValueFrom(
        this.http.post<{ token: string }>(backend.loginUrl, user)
      );

      if (!loginResponse?.token) {
        return false;
      }

      const headers = this.buildAuthHeaders(backend, loginResponse.token);
      await lastValueFrom(
        this.http.get<Record<string, unknown>>(backend.userInfoUrl, { headers })
      );

      return true;
    } catch {
      return false;
    }
  }

  private buildAuthHeaders(backend: BackendConfig, token: string): HttpHeaders {
    const rawHeaders: Record<string, string> = {
      [backend.tokenHeader]: token
    };

    if (backend.sendAuthorizationBearer) {
      rawHeaders['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(rawHeaders);
  }
}
