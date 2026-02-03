import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class Sidebar {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsEnum(['group'])
  @IsNotEmpty()
  type: 'group';

  @IsArray()
  children: any[];
}
