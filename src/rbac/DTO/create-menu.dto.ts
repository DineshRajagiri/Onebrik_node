import { IsNotEmpty, IsOptional, IsString, IsIn, IsNumber, IsBoolean } from 'class-validator';

export class CreateMenuDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  // optional - we'll auto-generate key if not provided
  @IsOptional()
  @IsString()
  key?: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['module', 'submodule', 'child'])
  type: 'module' | 'submodule' | 'child';

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  children?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  url?: string;

  // parentId required for submodule/child (but we'll allow server-side validation)
  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  breadcrumbs?: boolean;
}
