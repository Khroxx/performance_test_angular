/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JwtAuthService } from '../../services/jwt.auth.service';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let serviceSpy: jasmine.SpyObj<JwtAuthService>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj<JwtAuthService>(
      'JwtAuthService',
      ['getBackends', 'benchmarkBackend']
    );
    serviceSpy.getBackends.and.returnValue([
      {
        id: 'go',
        name: 'Go',
        loginUrl: 'http://localhost:8081/api/login',
        userInfoUrl: 'http://localhost:8081/api/userinfo',
        tokenHeader: 'GoToken'
      },
      {
        id: 'spring',
        name: 'Spring Boot',
        loginUrl: 'http://localhost:8082/api/login',
        userInfoUrl: 'http://localhost:8082/api/userinfo',
        tokenHeader: 'SpringToken'
      },
      {
        id: 'django-ninja',
        name: 'Django Ninja',
        loginUrl: 'http://localhost:8080/api/login',
        userInfoUrl: 'http://localhost:8080/api/userinfo',
        tokenHeader: 'DjangoToken'
      }
    ]);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: JwtAuthService, useValue: serviceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build requested number of random users', () => {
    const users = component.buildRandomUsers(100);

    expect(users.length).toBe(100);
    expect(users.every((entry) => entry.password === 'test')).toBeTrue();
  });

  it('should save benchmark result after run', async () => {
    serviceSpy.benchmarkBackend.and.resolveTo({
      backendId: 'go',
      backendName: 'Go',
      userCount: 1,
      totalTimeMs: 10,
      successCount: 1,
      failureCount: 0,
      status: 'success'
    });

    await component.runBenchmark('go', 1);

    const result = component.getResult('go', 1);
    expect(result).not.toBeNull();
    expect(result?.status).toBe('success');
    expect(component.isRunning('go', 1)).toBeFalse();
  });
});
