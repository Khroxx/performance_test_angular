/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { JwtAuthService } from './jwt.auth.service';

describe('JwtAuthService', () => {
  let service: JwtAuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JwtAuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(JwtAuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose three benchmark backends', () => {
    const backends = service.getBackends();

    expect(backends.length).toBe(3);
    expect(backends.map((entry) => entry.id)).toEqual(['go', 'spring', 'django-ninja']);
  });

  it('should mark batch as success when login and userinfo succeed', async () => {
    const promise = service.benchmarkBackend('go', [{ email: 'user10@test.com', password: 'test' }]);

    const loginReq = httpMock.expectOne('http://localhost:8081/api/login');
    expect(loginReq.request.method).toBe('POST');
    loginReq.flush({ token: 'abc-token' });

    const userInfoReq = httpMock.expectOne('http://localhost:8081/api/userinfo');
    expect(userInfoReq.request.method).toBe('GET');
    expect(userInfoReq.request.headers.get('GoToken')).toBe('abc-token');
    expect(userInfoReq.request.headers.get('Authorization')).toBe('Bearer abc-token');
    userInfoReq.flush({ email: 'user10@test.com' });

    const result = await promise;
    expect(result.status).toBe('success');
    expect(result.successCount).toBe(1);
    expect(result.failureCount).toBe(0);
  });

  it('should mark batch as failed when login fails', async () => {
    const promise = service.benchmarkBackend('go', [{ email: 'user10@test.com', password: 'wrong' }]);

    const loginReq = httpMock.expectOne('http://localhost:8081/api/login');
    loginReq.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    const result = await promise;
    expect(result.status).toBe('failed');
    expect(result.successCount).toBe(0);
    expect(result.failureCount).toBe(1);
  });
});
