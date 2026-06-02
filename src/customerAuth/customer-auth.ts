import { UpdateCustomerProfileDto } from "./DTO/update-customer-profile.dto";

export interface ICustomerService {

    sendOtp(email: string): Promise<{ success: boolean; message: string; data: { email: string; }; }>;

    verifyOtp(email: string, otp: string): Promise<{
        success: boolean; message: string; data:
        { accessToken: string; refreshToken: string; customer: { id: string; customerId: string; email: string; name?: string; profilePicture?: string; }; };
    }>;

    refreshToken(refreshToken: string): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    getProfile(customerId: string): Promise<{ success: boolean; data: { id: string; customerId: string; email: string; name?: string; mobileNumber?: string; profilePicture?: string; }; }>;

    upsertProfile(customerId: string, dto: UpdateCustomerProfileDto, imageUrl?: string
    ): Promise<{
        success: boolean; message: string;
        data: { id: string; customerId: string; email: string; name?: string; mobileNumber?: string; profilePicture?: string; };
    }>;

    sendOtpMobile(mobileNumber: string)
    verifyOtpMobile(mobileNumber: string, otp: string)

}