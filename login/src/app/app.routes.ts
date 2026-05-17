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
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component')
      .then(m => m.AdminComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./pages/forbidden/forbidden.component')
      .then(m => m.ForbiddenComponent),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
