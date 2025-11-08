import { IsNotEmpty } from 'class-validator';

export class AdminLoginDTO {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  password: string;
}