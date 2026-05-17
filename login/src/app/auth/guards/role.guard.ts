import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import { UserRole } from '../models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // on lit le rôle requis depuis les données de la route
  const requiredRole = route.data['role'] as UserRole;

  // sécurité — si la route n'a pas défini de rôle requis, on bloque
  if (!requiredRole) {
    console.warn('roleGuard : aucun rôle défini sur cette route');
    return router.createUrlTree(['/forbidden']);
  }

  // si le rôle correspond → accès accordé
  if (authStore.userRole() === requiredRole) {
    return true;
  }

  // sinon → page forbidden
  return router.createUrlTree(['/forbidden']);
};
