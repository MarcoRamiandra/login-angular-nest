import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // lit les rôles requis définis par @Roles()
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // si pas de @Roles() sur la route → accès libre
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // récupère le user injecté par JwtAuthGuard
        const { user } = context.switchToHttp().getRequest();

        // vérifie que le rôle du user est dans la liste requise
        return requiredRoles.includes(user?.role);
    }
}