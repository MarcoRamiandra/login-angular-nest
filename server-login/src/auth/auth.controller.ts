import {
    Controller,
    Post,
    Get,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RegisterAdminDto } from './dto';
import { JwtAuthGuard, JwtRefreshGuard, RolesGuard } from './guards';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    // POST /api/auth/register
    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    // POST /api/auth/login
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    // POST /api/auth/refresh
    // protégé par le refresh token
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtRefreshGuard)
    async refresh(@CurrentUser() user: any) {
        return this.authService.refresh(user.sub, user.refreshToken);
    }

    // POST /api/auth/logout
    // protégé par le access token
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async logout(@CurrentUser() user: any) {
        return this.authService.logout(user.id);
    }

    // GET /api/auth/profile
    // protégé par le access token
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async profile(@CurrentUser() user: any) {
        return this.authService.getProfile(user.id);
    }

    // POST /api/auth/register-admin
    // protégé — seul un admin peut créer un autre admin
    @Post('register-admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async registerAdmin(@Body() dto: RegisterAdminDto) {
        return this.authService.registerWithRole(dto);
    }

}