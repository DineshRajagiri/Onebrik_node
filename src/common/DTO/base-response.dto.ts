export class BaseResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;

  constructor(partial: Partial<BaseResponse<T>>) {
    Object.assign(this, partial);
  }

  static ok<T>(data: T, message = 'Success') {
    return new BaseResponse<T>({ success: true, message, data });
  }

  static fail(message: string, error?: any) {
    return new BaseResponse({ success: false, message, error });
  }
}
