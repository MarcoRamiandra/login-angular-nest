import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {

    // GET /api/admin/dashboard — admin only
    @Get('dashboard')
    @Roles('admin')
    getDashboard(@CurrentUser() user: any) {
        return {
            message: `Welcome ${user.email} to the admin dashboard.`,
            role: user.role,
        };
    }

    // GET /api/admin/users-area — admin & user
    @Get('users-area')
    @Roles('admin', 'user')
    getUsersArea(@CurrentUser() user: any) {
        return {
            message: `Welcome ${user.email}`,
            role: user.role,
        };
    }
}