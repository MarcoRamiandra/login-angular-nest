import { Routes } from '@angular/router';
import { authGuard, loginGuard, roleGuard } from './auth/guards';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component')
      .then(m => m.LoginComponent),
    canActivate: [loginGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard],           // connecté ?
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component')
      .then(m => m.AdminComponent),
    canActivate: [authGuard, roleGuard], // connecté ? + bon rôle ?
    data: { role: 'admin' }             // ← rôle requis ici
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./pages/forbidden/forbidden.component')
      .then(m => m.ForbiddenComponent),
    // pas de guard ici — accessible à tous
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
