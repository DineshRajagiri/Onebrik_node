import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { commonDTO } from "src/common/DTO/commonDTO";
import { Document } from "mongoose";

export type DeviceDetails = Device & Document;

@Schema()
export class Device extends commonDTO {
  @Prop({ required: true, unique: true })
  deviceId: string;

  @Prop()
  deviceToken: string;

  @Prop()
  deviceType: string; // 'ios' | 'android' | 'web'

  @Prop()
  osVersion: string;

  @Prop()
  appVersion: string;

  @Prop()
  fcmToken: string; // For push notifications
}

export const DeviceSchemaFile = SchemaFactory.createForClass(Device);

DeviceSchemaFile.pre<DeviceDetails>('save', async function (next) {
  if (!this.deviceId) {
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    this.deviceId = `DEV${Date.now()}${randomCode}`;
  }
  next();
});

export default { name: Device.name, schema: DeviceSchemaFile };


