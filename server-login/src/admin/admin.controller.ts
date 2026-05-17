import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)  // appliqué sur tout le controller
export class AdminController {

    // GET /api/admin/dashboard
    // accessible uniquement aux admins
    @Get('dashboard')
    @Roles('admin')
    getDashboard(@CurrentUser() user: any) {
        return {
            message: `Bienvenue ${user.email} sur le dashboard admin.`,
            role: user.role,
        };
    }

    // GET /api/admin/users-area
    // accessible aux admins ET aux users
    @Get('users-area')
    @Roles('admin', 'user')
    getUsersArea(@CurrentUser() user: any) {
        return {
            message: `Bienvenue ${user.email}`,
            role: user.role,
        };
    }
}