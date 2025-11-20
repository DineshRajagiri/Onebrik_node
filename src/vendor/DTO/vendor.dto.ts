import { Prop } from "@nestjs/mongoose"
import { IsNotEmpty, IsOptional } from "class-validator";
import { admin } from "src/schema/admin.schema";
import { category } from "src/schema/category.schema";
import { region } from "src/schema/region.schema";

export class vendorDTO {
    @Prop()
    @IsNotEmpty()
    vendorName: string;

    @Prop()
    emailID: string;

    @Prop()
    mobileNumber: string;

    @Prop()
    category: string;

    @Prop()
    region: string;

    @Prop()
    adress1: string;

    @Prop()
    country: string;

    @Prop()
    state: string;

    @Prop()
    city: string;

    @Prop()
    postalCode: string;

    @Prop()
    gstNumber: string;

    @Prop()
    uploadLogo: string;

    @IsNotEmpty()
    @Prop({ type: String, ref: "admin" })
    adminId: admin;

    @IsNotEmpty()
    @Prop({ type: String, ref: "region" })
    regionId: region;

    @IsNotEmpty()
    @Prop({ type: String, ref: "category" })
    categoryId: category;
}
