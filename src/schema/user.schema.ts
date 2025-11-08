import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString } from 'class-validator';
import { Connection, Document, SchemaTypes, Types } from 'mongoose';
import { commonDTO } from 'src/common/DTO/commonDTO';
import { Roles, isUserStatus } from 'src/utils/constants';
import { CounterDocument } from './counter.schema';
export type UserDocument = user & Document;

@Schema()
export class user extends commonDTO {
  @Prop()
  customerId: string;

  @Prop()
  email: string;

  @Prop()
  fullName: string;

  @Prop()
  mobileNumber: string;

  @Prop()
  referralCode: string;

  @Prop({ type: String, enum: Roles, default: Roles.USER })
  role: Roles;

  @Prop({ default: null })
  passwordHash: string;

  @Prop()
  salt: string;

  @Prop()
  logid: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  istermAndPolicy: boolean;

  @Prop()
  passwordExpDate: string;

  @Prop()
  resetPasswordExpires: Date;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  profileImage: string;
  @Prop({ default: false })
  isVerifiedByAdmin: boolean;

  @Prop({type:String,enum:isUserStatus,default:isUserStatus.PENDING})
  userStatus: isUserStatus;

  @Prop()
  refreshToken: string;

  @Prop()
  aadharName: string;

  @Prop()
  aadharNumber: string;

  @Prop()
  gender: string;

  @Prop()
  dob: string;

  @Prop()
  houseNo: string;

  @Prop()
  street: string;

  @Prop()
  landMark: string;

  @Prop()
  state: string;

  @Prop()
  district: string;

  @Prop()
  country: string;

  @Prop()
  panNumber: string;

  @Prop()
  nomineeName: string;

  @Prop()
  nomineeEmail: string;

  @Prop()
  nomineeMobileNumber: string;

  @Prop()
  relationship: string;

  @Prop()
  nomineeDob: string;

  @Prop()
  nomineeAdress: string;

  @Prop()
  accountHolderName: string;

  @Prop()
  accountNumber: string;

  @Prop()
  ifscCode: string;

  @Prop()
  bankName: string;

  @Prop()
  uploadBankDetail: string

  @Prop()
  experiences: string;

  @Prop()
  incomeRange: string;

  @Prop()
  professions: string;
  static uploadLogo: any;
  static walletBalance: any;
  @Prop()
    userId: string;

}

export const userSchemaFile = SchemaFactory.createForClass(user);


userSchemaFile.pre<UserDocument>('save', async function (next) {
  if (!this.customerId) {
    const connection: Connection = this.collection.conn;
    const counterModel = connection.model<CounterDocument>('Counter');

    const counter = await counterModel.findOneAndUpdate(
      { field: 'customerId' },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );

    // this.enterpriseId = counter?.sequenceValue || 30000; 
    this.customerId = `IT3000${counter?.sequenceValue}`
  }
  next();
});

export default { name: user.name, schema: userSchemaFile };