import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { user, UserDocument } from 'src/schema/user.schema';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Roles, Services, userResponseMessage } from 'src/utils/constants';
import * as jwt from 'jsonwebtoken';
import { IAuthService } from './auth';
import { INotificationService } from 'src/notification/notification';
import { CreateAdminDTO } from './DTO/createAdmin.dto';
import { admin, adminDetails } from 'src/schema/admin.schema';
import axios from 'axios';
import { AdminLoginDTO } from './DTO/adminLogin.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AadharDTO } from './DTO/aadhar.dto';
import { PanDTO } from './DTO/pan.dto'; 
import { STATUS_CODES } from 'src/utils/status-codes';
import { RESPONSE_MESSAGES } from 'src/utils/response-messages';

@Injectable()
export class AuthService implements IAuthService {
  private refreshInterval: NodeJS.Timeout;
  constructor(
    // @Inject(Services.AUTH) 
    // private authService: IAuthService,
    @InjectModel(user.name) private readonly user: Model<UserDocument>,
    @InjectModel(admin.name) private readonly admin: Model<adminDetails>,
    @Inject(Services.NOTIFICATION) private notificationService: INotificationService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    // private userService: UserService,
  ) { }


  onModuleDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  async validateUser(user: any): Promise<any> {
    return user;
  }

  async checkAdmin(singupEntity: CreateAdminDTO): Promise<any> {
    try {
      singupEntity.email = singupEntity.email.toLowerCase()
      const checkAdmins: any = await this.admin.findOne({
        email: singupEntity.email
      });
      if (checkAdmins?.isActive == true) {

        return {
          success: false,
          message: 'email already registered'
        };
      }
      if (checkAdmins?.isVerified == true || checkAdmins?.isVerified == false) {

        return this.signUpUpdateAdmin(checkAdmins?._id, singupEntity);
      }
      return this.signUpNewAdmin(singupEntity);
    } catch (e) {
      throw new HttpException({ success: false, message: e?.message }, HttpStatus.BAD_REQUEST)
    }
  }

  async signUpUpdateAdmin(_id: string, signUpEntity: CreateAdminDTO) {
    try {
      const objectId = new mongoose.Types.ObjectId(_id);
      const hash = bcrypt.hashSync(signUpEntity.password, bcrypt.genSaltSync(10));
      signUpEntity.email = signUpEntity.email.toLowerCase();

      const updatedAdmin = await this.admin.findByIdAndUpdate(
        objectId,
        {
          $set: {
            ...signUpEntity,
            passwordHash: hash,
            updatedAt: new Date(),
            isVerified: false,
          },
        },
        { new: true },
      );

      if (!updatedAdmin) {
        throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
      }

      await this.admin.findByIdAndUpdate(
        updatedAdmin.id,
        {
          $set: {
            email: signUpEntity.email,
            passwordHash: hash,
            role: Roles.SUPERADMIN,
            updatedAt: new Date(),
          },
        },
      );

      return {
        success: true,
        message: 'Admin updated successfully',
        user: updatedAdmin,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error?.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async signUpNewAdmin(signupEntity: CreateAdminDTO) {
    try {
      const hash = await bcrypt.hash(signupEntity.password, 10);
      signupEntity.email = signupEntity.email.toLowerCase();

      const newGeneralUser = await this.admin.create({
        email: signupEntity.email,
        passwordHash: hash,
        role: Roles.SUPERADMIN,
        isVerified: false,
        isActive: true,
      });

      const newAdmin = await this.admin.create({
        ...signupEntity,
        passwordHash: hash,
        generalUserId: newGeneralUser._id,
      });

      return {
        success: true,
        message: 'Admin registered successfully',
        user: newAdmin
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error?.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async signUpUser(userData: { email: string; fullName: string; mobileNumber: string; referralCode: string }) {
    try {
      const existingUser = await this.user.countDocuments({
        $or: [
          { email: userData.email?.toLowerCase() },
          { mobileNumber: userData.mobileNumber },
        ],
      });
  
      if (existingUser > 0) {
        throw new HttpException(
          {
            success: false,
            statusCode: STATUS_CODES.CONFLICT,
            message: RESPONSE_MESSAGES.USER_EXISTS,
          },
          STATUS_CODES.CONFLICT
        );
      }
  
      const otpSent = await this.sendOtp(userData.mobileNumber);
      if (otpSent.success) {
        return {
          success: true,
          statusCode: STATUS_CODES.SUCCESS,
          message: RESPONSE_MESSAGES.OTP_SENT,
          userData: {
            ...userData,
            logid: otpSent.logid,
          },
        };
      } else {
        throw new HttpException(
          {
            success: false,
            statusCode: STATUS_CODES.BAD_REQUEST,
            message: otpSent.message,
          },
          STATUS_CODES.BAD_REQUEST
        );
      }
    } catch (error) {
      // Ensure the error keeps its original status
      if (error instanceof HttpException) {
        throw error; // Preserve status code (409, 400, etc.)
      }
  
      throw new HttpException(
        {
          success: false,
          statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
          message: error?.message || RESPONSE_MESSAGES.SERVER_ERROR,
        },
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  async sendOtp(mobileNumber: string): Promise<{ success: boolean; message: string; logid?: string }> {
    try {
      const response = await axios.get('https://global.datagenit.com/API/generate_otp.php', {
        params: {
          auth: 'D!~10086OjcIj92RPz',
          senderid: 'ETVPL',
          msisdn: mobileNumber,
          entity_id: '1701165226643819791',
        },
        headers: {
          'cache-control': 'no-cache',
        },
      });

      console.log('OTP Service Response:', response.data);

      if (response.data.status === 'success') {
        return { success: true, message: 'OTP sent successfully', logid: response.data.logid };
      } else {
        return {
          success: false,
          message: response.data.desc || 'Failed to send OTP.',
        };
      }
    } catch (error) {
      console.error('OTP Service Error:', error);
      return { success: false, message: 'Failed to send OTP due to an error.' };
    }
  }

  async verifyOtp(
    mobileNumber: string,
    logid: string,
    otp: string
  ): Promise<{ success: boolean; data: { message: string } }> {
    try {
      const response = await axios.get('https://global.datagenit.com/API/verify_otp.php', {
        params: {
          auth: 'D!~10086OjcIj92RPz',
          msisdn: mobileNumber,
          logid: logid,
          otp: otp,
        },
        headers: {
          'cache-control': 'no-cache',
        },
      });

      console.log('Verify OTP Response:', response.data);
      if (response.data.status === 'success') {
        return {
          success: true,
          data: { message: response.data.desc || 'OTP verified successfully' },
        };
      }
      const errorMessages: { [key: number]: string } = {
        401: 'Authentication failed. Please check your credentials.',
        402: 'Invalid authentication key.',
        405: 'Missing required parameters. Please ensure all fields are filled.',
        407: 'Access denied. Your IP might not be whitelisted.',
        410: 'Mobile number not provided.',
        417: 'OTP not provided.',
        418: 'Invalid request. Please try again.',
        419: 'Invalid OTP. Please ensure the entered OTP is correct.',
        421: 'OTP time limit exceeded. Please request a new OTP.',
        422: 'OTP has already been verified for this request.',
        429: 'Insufficient balance to process the request.',
        443: 'Log ID not provided. Please ensure the log ID is included.', 
      };

      const failureMessage =
        errorMessages[response.data.code] || response.data.desc || 'Unknown error occurred.';

      return {
        success: false,
        data: { message: failureMessage },
      };
    } catch (error) {
      console.error('Verify OTP Service Error:', error.message || error);
      return {
        success: false,
        data: { message: 'Failed to verify OTP due to a system error.' },
      };
    }
  }

  async verifyOtpAndSaveUser(
    otp: string,
    userData: {
      email: string;
      fullName: string;
      mobileNumber: string;
      logid: string;
      referralCode: string;
    },
  ): Promise<
    | {
      success: true;
      message: string;
      userDetails: {
        id: string;
        fullName: string;
        email: string;
        mobileNumber: string;
        logid: string;
        referralCode: string;
      };
    }
    | { success: false; message: string }
  > {
    const otpVerificationResult = await this.verifyOtp(userData.mobileNumber, userData.logid, otp);

    if (otpVerificationResult.success) {
      try {
        const newUser = await this.user.create({
          email: userData.email?.toLowerCase(),
          fullName: userData?.fullName,
          mobileNumber: userData?.mobileNumber,
          logid: userData?.logid,
          referralCode: userData?.referralCode,
          createdAt: new Date(),
          isOtpVerified: true,
        });
        console.log(newUser)
        return {
          success: true,
          message: 'User registered successfully.',
          userDetails: {
            id: newUser._id.toString(),
            fullName: newUser.fullName,
            email: newUser.email,
            mobileNumber: newUser.mobileNumber,
            logid: newUser.logid,
            referralCode: newUser.referralCode
          },
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to save user. Please try again later.',
        };
      }
    } else {
      return {
        success: false,
        message: otpVerificationResult.data.message,
      };
    }
  }




  async initiateLogin(phoneNumber: string) {
    try {
      const user = await this.user.findOne({ mobileNumber: phoneNumber });

      if (!user) {
        return { success: false, message: 'User not found.' };
      }

      const otpSent = await this.sendOtp(phoneNumber);
      if (otpSent.success) {
        return {
          success: true,
          message: 'OTP sent successfully.',
          logid: otpSent.logid,
        };
      } else {
        return { success: false, message: otpSent.message };
      }
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyOtpAndLogin(phoneNumber: string, otp: string, logid: string) {
    try {
      const otpVerification = await this.verifyOtp(phoneNumber, logid, otp);

      if (!otpVerification.success) {
        return { success: false, message: otpVerification.data.message };
      }

      const user = await this.user.findOne({ mobileNumber: phoneNumber });

      if (!user) {
        return { success: false, message: 'User not found.' };
      }
      const accessToken = await this.createAccessToken(user);
      const refreshToken = await this.createRefreshToken({ id: user._id });
      await this.user.updateOne({ _id: user._id }, { refreshToken: refreshToken });
      return {
        success: true,
        message: `Hi ${user.fullName}, you logged in successfully.`,
        isadminExists: false,
        data: {
          accessToken: accessToken.accessToken,
          refreshToken: refreshToken,
          userDetails: {
            _id: accessToken.data._id,
            fullName: user.fullName,
            email: accessToken.data.email,
            role: accessToken.data.role,
            rememberMe: accessToken.data.rememberMe,
          }
        }
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



  // async createAccessToken(payload: any): Promise<string> {
  //   const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
  //   return this.jwtService.sign(payload, {
  //     secret: secret || 'default_access_secret',
  //     expiresIn: '2m',
  //   });
  // }

  async createAccessToken(data: any) {
    const privateKey = process.env.JWT_ACCESS_TOKEN_SECRET;
    const expiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRE;
    const payload = {
      email: data.email,
      _id: data._id,
      mobileNo: data.mobileNo,
      role: data.role,
      isVerifiedByAdmin: data.isVerifiedByAdmin,
      displayName: data?.fullName,
      profileImage: data?.profileImage,
    };
    const userInfo = {
      ...data.toObject(), 
    };
  
    delete userInfo.resetPasswordToken;
    delete userInfo.salt;
    delete userInfo.passwordHash;
    delete userInfo.createdAt;
    delete userInfo.isDeleted;
    delete userInfo.isVerified;
  
    return {
      data: userInfo,
      success: true,
      accessToken: jwt.sign(payload, privateKey, {
        algorithm: 'HS256',
        expiresIn,
      }),
    };
  }
  

  async createRefreshToken(user: any) {
    const privateKey = process.env.JWT_REFRESH_TOKEN_SECRET;
    const expiresIn = process.env.JWT_REFRESH_TOKEN_EXPIRE || '7d';
  
    const payload = {
      _id: user.id,
    };
  
    return jwt.sign(payload, privateKey, {
      algorithm: 'HS256',
      expiresIn,
    });
  }
  

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      });
  
      let user = await this.user.findOne({ _id: decoded._id, refreshToken });
      if (!user) {
        user = await this.admin.findOne({ _id: decoded._id, refreshToken });
      }
  
      if (!user) {
        throw new HttpException("Invalid refresh token.", HttpStatus.UNAUTHORIZED);
      }
  
      const newAccessToken = await this.createAccessToken(user);
      const newRefreshToken = await this.createRefreshToken(user);
      await user.updateOne({ refreshToken: newRefreshToken });
  
      return {
        success: true,
        message: "Token refreshed successfully.",
        data: {
          accessToken: newAccessToken.accessToken,
          // accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error) {
      console.error("Refresh Token Error:", error);
      throw new HttpException("Invalid refresh token.", HttpStatus.UNAUTHORIZED);
    }
  }
  
  




  async checkUser(data) {
    try {
      const checkUser: any = await this.user.findOne({
        $or: [
          { email: data.username.toLowerCase() },
          { mobileNo: data.username.toLowerCase() },
        ],
      });

      if (
        !checkUser ||
        checkUser?.isDeleted == true

      ) {
        // this.logger.warn(`${data.username} is try to logIn`)
        return { success: false, message: 'Incorrect username or password' };
      }
      if (checkUser?.isActive == false) {
        return { success: false, message: 'Your credentials has been deactivated by the superadmin' };
      }
      const mathPassword = bcrypt.compareSync(
        data?.password,
        checkUser?.passwordHash,
      );
      if (mathPassword === false) {
        return { success: false, message: 'Incorrect username or password' };
      }
      let creatFCM: any
      if (data?.notification_token) {
        creatFCM = await this.notificationService.createNotificationToken({ userId: checkUser._id, notification_token: data?.notification_token, deviceType: data?.deviceType })
      }
      const loginDetails = await this.createAccessToken(checkUser);
      // const obj={
      //   user:loginDetails?.data?._id,
      //   title:"user Locked in",
      //   body:"User has been locked in pleace check"
      // }
      // await this.notificationService.sendPush(obj)
      return Object.assign(loginDetails, {
        success: true,
        isUserExists: true,
        message: 'User exists',
      });
    } catch (e) {
      throw new HttpException(
        { success: false, message: e?.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  async adminLogin(data: AdminLoginDTO) {
    try {
      const checkAdmin: any = await this.admin.findOne({ email: data.username.toLowerCase() });
  
      if (!checkAdmin || checkAdmin?.isDeleted == true) {
        return { success: false, message: 'Incorrect adminname or password' };
      }
  
      if (checkAdmin?.isActive == false) {
        return { success: false, message: 'Your credentials have been deactivated by the superadmin' };
      }
  
      const mathPassword = bcrypt.compareSync(data?.password, checkAdmin?.passwordHash);
      if (mathPassword === false) {
        return { success: false, message: 'Incorrect adminname or password' };
      }
  
      const accessToken = await this.createAccessToken(checkAdmin);
      const refreshToken = await this.createRefreshToken({ id: checkAdmin._id });
  
      await this.admin.updateOne({ _id: checkAdmin._id }, { refreshToken: refreshToken });
  
      return {
        success: true,
        isadminExists: true,
        message: 'Admin exists',
        data: {
          accessToken: accessToken.accessToken,
          refreshToken: refreshToken,
          userDetails: {
            _id: accessToken.data._id,
            email: accessToken.data.email,
            role: accessToken.data.role,
            rememberMe: accessToken.data.rememberMe,
            fullName: accessToken.data.fullName,
            adminProfile: accessToken.data.adminProfile,
                        },
        },
      };
    } catch (e) {
      throw new HttpException(
        { success: false, message: e?.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  

  async getStoredRefreshToken() {
    return 'your-refresh-token';
  }

  async storeNewRefreshToken(newRefreshToken: string) {
    console.log('New refresh token stored:', newRefreshToken);
  }


  
  

}
