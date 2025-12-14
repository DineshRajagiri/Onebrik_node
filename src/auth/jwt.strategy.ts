import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ||
        'default_access_secret',
    });
  }

  async validate(payload: any) {
    /**
     * payload example:
     * {
     *   sub: userId,
     *   email: string,
     *   role: string,
     *   iat: number,
     *   exp: number
     * }
     */

    if (!payload?.sub) {
      throw new UnauthorizedException();
    }

    // 👇 THIS BECOMES req.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
