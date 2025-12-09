import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    // payload will come from createAccessToken()
    // We expect: { id, email, role, isVerifiedByAdmin }

    if (!payload || !payload.id) {
      throw new UnauthorizedException('Invalid Token');
    }

    // This object becomes request.user
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      isVerifiedByAdmin: payload.isVerifiedByAdmin ?? false,
    };
  }
}
