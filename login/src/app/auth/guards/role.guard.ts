import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import { UserRole } from '../models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const requiredRole = route.data['role'] as UserRole;

  if (!requiredRole) {
    console.warn('roleGuard — no role defined on this route');
    return router.createUrlTree(['/forbidden']);
  }

  if (authStore.userRole() === requiredRole) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};
