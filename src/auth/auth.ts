import { ValidateUserDetails, changePassword, loginUserDetails, verifyOtp } from "src/utils/types";
import { CreateAdminDTO } from "./DTO/createAdmin.dto";
import { AdminLoginDTO } from "./DTO/adminLogin.dto";

export interface IAuthService {
  validateUser(userDetails: ValidateUserDetails);
  createAccessToken(data: any);
  signUpUser(User: any);
  verifyOtpAndSaveUser(otp: string, userData: { email: string; fullName: string; mobileNumber: string; logid: string; referralCode: string; },): Promise<
    {
      success: true; message: string; userDetails: {
        id: string;
        fullName: string;
        email: string;
      };
    }
    | { success: false; message: string }
  >;

  checkAdmin(collectionName: CreateAdminDTO): Promise<string>;
  adminLogin(data: AdminLoginDTO);
  verifyOtp(
    phoneNumber: string,
    logid: string,
    otp: string
  ): Promise<{ success: boolean; data: { message: string } }>;
  verifyOtpAndLogin(
    phoneNumber: string,
    logid: string,
    otp: string
  ): Promise<| { success: boolean; message: string; data?: any }| {success: boolean; message: string; data: {
        accessToken: string;
        refreshToken: string;
        userDetails: {
          id: string;
          fullName: string;
          email: string;
        };
      };
    }
  >;
  initiateLogin(data: any)
  refreshToken(refreshToken: any): Promise<{ success: boolean; message: string; data: any }>;
  login(data: any)
}

