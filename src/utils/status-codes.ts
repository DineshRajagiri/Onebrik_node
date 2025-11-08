import { HttpStatus } from '@nestjs/common';

export const STATUS_CODES = {
  SUCCESS: HttpStatus.OK, 
  CREATED: HttpStatus.CREATED, 
  BAD_REQUEST: HttpStatus.BAD_REQUEST, 
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED, 
  FORBIDDEN: HttpStatus.FORBIDDEN, 
  NOT_FOUND: HttpStatus.NOT_FOUND, 
  CONFLICT: HttpStatus.CONFLICT, 
  INTERNAL_SERVER_ERROR: HttpStatus.INTERNAL_SERVER_ERROR, 
};
