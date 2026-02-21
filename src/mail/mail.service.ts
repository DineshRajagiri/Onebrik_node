import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

  }

  async sendOtpEmail(to: string, otp: string, purpose: string = 'verification') {
    const subject =
      purpose === 'signup'
        ? 'Verify your email - OneBrik Signup'
        : 'Your login OTP - OneBrik';

    await this.transporter.sendMail({
      from: `"OneBrik" <Bhushanpawar2112001@gmail.com>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #333;">OneBrik Verification</h2>
          <p>Your OTP for ${purpose} is:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2563eb;">${otp}</p>
          <p style="color: #666;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
          <p style="font-size: 12px; color: #999;">OneBrik Team</p>
        </div>
      `,
    });
  }

  async sendMail(email: string, name: string, password: string) {
    return this.transporter.sendMail({
      from: `"Bhushan" <Bhushanpawar2112001@gmail.com>`,
      to: `${email}`,
      subject: 'Account Activated',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>ONEBRICK Login Details</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px 15px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#111827;color:#ffffff;padding:20px 30px;text-align:center;">
              <h1 style="margin:0;font-size:26px;letter-spacing:1px;">ONEBRICK</h1>
              <p style="margin:6px 0 0;font-size:14px;opacity:0.8;">
                Welcome to ONEBRICK
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:30px;">
              <h2 style="color:#111827;margin-top:0;">
                Your account is ready
              </h2>

              <p style="color:#374151;font-size:15px;line-height:1.6;">
                Hello <strong>${name}</strong>,
              </p>

              <p style="color:#374151;font-size:15px;line-height:1.6;">
                Your <strong>ONEBRICK</strong> account has been created successfully.
                You can log in using the credentials below:
              </p>

              <!-- Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;margin:20px 0;">
                <tr>
                  <td style="padding:15px;">
                    <p style="margin:0;color:#111827;font-size:14px;">
                      <strong>Email:</strong> ${email}
                    </p>
                    <p style="margin:8px 0 0;color:#111827;font-size:14px;">
                      <strong>Password:</strong> ${password}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Button -->
              <div style="text-align:center;margin:30px 0;">
                <a href="{{LOGIN_URL}}"
                   style="background:#2563eb;color:#ffffff;padding:12px 26px;
                          text-decoration:none;border-radius:6px;font-size:15px;
                          display:inline-block;">
                  Login to ONEBRICK
                </a>
              </div>

              <p style="color:#6b7280;font-size:13px;line-height:1.6;">
                If you have any questions, feel free to contact the ONEBRICK support team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f3f4f6;padding:15px 30px;text-align:center;">
              <p style="margin:0;color:#6b7280;font-size:12px;">
                © ${new Date().getFullYear()} ONEBRICK. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
      ,
    });
  }
}
