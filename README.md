# performance_test_angular

Angular 20 frontend for JWT login performance benchmark.

## Role in project

- Provides single-page benchmark UI with three backend cards.
- Triggers concurrent login batches (1, 100, 1000, 10000).
- Shows measured time per backend and batch size.

## Repository map and clone URLs

- `performance_test_angular` (frontend): `https://github.com/Khroxx/performance_test_angular.git`
- `performance_test_go` (Go backend): `https://github.com/Khroxx/performance_test_go.git`
- `performance_test_django` (Django Ninja backend): `https://github.com/Khroxx/performance_test_django.git`
- `performance_test_java` (Spring Boot backend): `https://github.com/Khroxx/performance_test_java.git`
- `performance_test_db` (shared PostgreSQL 17): `https://github.com/Khroxx/performance_test_db.git`

## Local run

```bash
ng serve
```

Frontend runs on `http://localhost:4200`.

## Build

```bash
ng build
```

## Tests

```bash
ng test
```
