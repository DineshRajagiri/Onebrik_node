import { User } from 'src/schema/user.schema';

export type CreateUserDetails = {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    displayName: string;
    // employeeId: string;
    // companyDomain: string;
    rememberMe: boolean;
    passwordHash: string;
    salt: string;
    isVerified: boolean;
    passwordExpDate: string;
    // companyId: string;
    profileImage: string;
    isVerifiedByAdmin: boolean;
    departmentsId: string;
  };

  export type ValidateUserDetails = {
    password: string;
    email: string;
  };

  export type changePassword = {
    email: string;
    password: string;
  };

  export type loginUserDetails = {
    username: string;
    password: string;
  };

  export type verifyOtp = {
    email: string;
    otp: string;
  };