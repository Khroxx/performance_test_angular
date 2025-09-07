import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

interface LoginResult {
  backend: string;
  token: string | null;
  timeMs: number;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class JwtAuthService {

  /**
   * DO NOT CHANGE UNLESS YOU CHANGED IT IN THE BACKEND REPOSITORIES
   * OR YOU WANT TO ADD ANOTHER BACKEND YOURSELF
   */
    private backends = [
    { name: 'Django', url: 'http://localhost:8080/api/login' },
    { name: 'Go', url: 'http://localhost:8081/api/login' },
    { name: 'Spring', url: 'http://localhost:8082/api/login' }
  ];

  constructor(
    private http: HttpClient
  ) { }

  async login(email: string, password: string): Promise<LoginResult[]> {
    const results: LoginResult[] = [];
    await Promise.all(this.backends.map(async backend => {
      const start = performance.now();
      try {
        const response = await lastValueFrom(
          this.http.post<{ token: string }>(
            backend.url,
            { email, password }
          )
        );
        results.push({
          backend: backend.name,
          token: response?.token ?? null,
          timeMs: performance.now() - start
        });
      } catch (error) {
        results.push({
          backend: backend.name,
          token: null,
          timeMs: performance.now() - start,
          error
        });
      }
    }));
    return results;
  }
}
