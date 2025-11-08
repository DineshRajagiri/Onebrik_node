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

  async validate(payload?: any) {
    // console.log('🔹 Decoded Payload:', payload); 

    if (!payload || !payload.id) {
      console.log('❌ Invalid Token or Payload Missing'); 
      throw new UnauthorizedException('Invalid Token');
    }

    return { userId: payload.id };
  }
}
