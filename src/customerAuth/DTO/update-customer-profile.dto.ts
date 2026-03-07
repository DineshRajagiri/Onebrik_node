import { IsOptional, IsString } from 'class-validator';

export class UpdateCustomerProfileDto {

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    mobileNumber?: string;

}