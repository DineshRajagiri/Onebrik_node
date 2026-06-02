import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SmsService {
  

  async verifyAccessToken(accessToken: string) {

    const authKey = process.env.MSG91_AUTH_KEY || process.env.MSG91_SECRET || '521327TIBKabknsWDb6a1bc3b2P1';

    // First, try the MSG91 verifyAccessToken API (preferred)
    try {
      const response = await axios.post(
        'https://control.msg91.com/api/v5/widget/verifyAccessToken',
        {
          authkey: authKey,
          'access-token': accessToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      return response.data;
    } catch (err: any) {
      // If the remote call fails (401, network), try local JWT verification as a fallback
      try {
        const decoded: any = jwt.verify(accessToken, authKey);

        return {
          success: true,
          // MSG91 token payload contains requestId and companyId
          requestId: decoded.requestId || decoded.requestID || decoded.request_id,
          companyId: decoded.companyId || decoded.companyID || decoded.company_id,
          // remote API normally returns the mobile number; we don't have it here
          // caller may need to fetch mobile by requestId via MSG91 API or other persistence
        };
      } catch (verifyErr) {
        throw new UnauthorizedException('Invalid MSG91 access token');
      }
    }
  }
}