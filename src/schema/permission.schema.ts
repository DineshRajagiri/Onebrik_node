import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type permissionDetails = permission & Document;

class PermissionEntry {
  @Prop({ required: true, type: String }) 
  modulesId: string;

  @Prop({ type: String }) 
  subModuleId?: string;

  @Prop({ type: String }) 
  subModuleChildId?: string;

  @Prop({ required: true, type: Boolean }) 
  isAdd: boolean;

  @Prop({ required: true, type: Boolean }) 
  isEdit: boolean;

  @Prop({ required: true, type: Boolean }) 
  isDelete: boolean;

  @Prop({ required: true, type: Boolean }) 
  isRead: boolean;
}

@Schema()
export class permission extends Document {
  @Prop({ required: true, type: String }) 
  adminId: string;

  @Prop({ type: [PermissionEntry], default: [] }) 
  permissions: PermissionEntry[];
}

export const permissionSchemaFile = SchemaFactory.createForClass(permission);
