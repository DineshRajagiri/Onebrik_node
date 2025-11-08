export const RESPONSE_MESSAGES = {
    USER_EXISTS: 'User already exists.',
    OTP_SENT: 'OTP sent. Please verify to complete registration.',
    OTP_FAILED: 'Failed to send OTP.',
    SERVER_ERROR: 'Something went wrong. Please try again later.',
};

export enum userResponseMessage {
    NOT_FOUND = "User not found",
    FOUND = "User found successfully",
    CREATE = "User created successfully",
    CREATE_ERROR = "Unable to create user",
    UPDATE = "User updated successfully",
    UPDATE_ERROR = "Unable to update user",
    UNAUTHORIZED = "Unauthorized user",
    NOT_FOUND_LIST = "User list not found",
    FOUND_LIST = "User list found successfully",
    EXIST = "User already exists",
}