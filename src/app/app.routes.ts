import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'home', redirectTo: '', pathMatch: 'full' },
    { path: 'login', redirectTo: '', pathMatch: 'full' },
    { path: '**', redirectTo: '' }
];
