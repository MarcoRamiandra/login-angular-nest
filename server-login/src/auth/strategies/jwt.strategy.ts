import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

export interface JwtPayload {
    sub: string;
    email: string;
    role: 'admin' | 'user';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {
        super({
            // extrait le token depuis le header Authorization: Bearer <token>
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
            ignoreExpiration: false,
        });
    }

    // appelée automatiquement si le token est valide
    // ce qu'on retourne ici est injecté dans req.user
    async validate(payload: JwtPayload) {
        const user = await this.userService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('Utilisateur introuvable.');
        }
        return { id: user.id, email: user.email, role: user.role };
    }
}