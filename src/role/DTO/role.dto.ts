import { IsString } from 'class-validator';

export class CreateRoleDTO {
  @IsString()
  name: string;
}
