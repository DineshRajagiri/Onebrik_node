import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseResponse } from '../DTO/base-response.dto';
// import { BaseResponse } from '../dtos/base-response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();
      message = res?.message || exception.message;
      error = res;
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.stack;
    }

    response.status(status).json(
      BaseResponse.fail(message, process.env.NODE_ENV === 'development' ? error : undefined),
    );
  }
}
