import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto, RegisterAdminDto } from './dto';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.userService.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('This email is already in use.');
        }

        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.userService.create({
            email: dto.email,
            password: hashed,
            role: 'user',
        });

        return this.sanitize(user);
    }

    async login(dto: LoginDto) {
        const user = await this.userService.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedException('Email or password is incorrect.');
        }

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Email or password is incorrect.');
        }

        const tokens = await this.generateTokens(user);

        await this.saveRefreshToken(user.id, tokens.refreshToken);

        return {
            user: this.sanitize(user),
            tokens,
        };
    }

    async refresh(userId: string, refreshToken: string) {
        const user = await this.userService.findById(userId);
        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('Session expired.');
        }

        const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isMatch) {
            throw new UnauthorizedException('Session expired.');
        }

        const tokens = await this.generateTokens(user);

        await this.saveRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    async logout(userId: string) {
        await this.userService.updateRefreshToken(userId, null);
        return { message: 'Logged out successfully.' };
    }

    async getProfile(userId: string) {
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found.');
        }
        return this.sanitize(user);
    }

    private async generateTokens(user: User) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
                expiresIn: '15m' as const,
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d' as const,
            }),
        ]);

        return {
            accessToken,
            refreshToken,
            expiresAt: Date.now() + 15 * 60 * 1000,
        };
    }

    private async saveRefreshToken(userId: string, refreshToken: string) {
        const hashed = await bcrypt.hash(refreshToken, 10);
        await this.userService.updateRefreshToken(userId, hashed);
    }

    private sanitize(user: User) {
        const { password, refreshToken, ...safe } = user;
        return safe;
    }

    async registerWithRole(dto: RegisterAdminDto) {
        const existing = await this.userService.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('This email is already in use.');
        }
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.userService.create({
            email: dto.email,
            password: hashed,
            role: dto.role,
        });
        return this.sanitize(user);
    }
}