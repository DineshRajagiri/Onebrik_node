import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';

export class SidebarChildDto {

  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsIn(['group', 'collapse', 'item'])
  type: 'group' | 'collapse' | 'item';

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsIn(['custom', 'master'])
  routeType?: 'custom' | 'master';

  @IsOptional()
  @IsString()
  tableKey?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SidebarChildDto)
  children?: SidebarChildDto[];
}
