import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type permissionDetails = Permission & Document;

@Schema({ timestamps: true })
export class Permission {

  @Prop({ type: String, required: true })
  roleId: string;

  @Prop({ type: String, default: null })
  userId?: string | null;

  @Prop({ type: String })
  moduleId: string;

  @Prop({ type: String })
  subModuleId?: string;

  @Prop({ type: String })
  subModuleChildId?: string;

  @Prop({ default: false })
  canView: boolean;

  @Prop({ default: false })
  canCreate: boolean;

  @Prop({ default: false })
  canUpdate: boolean;

  @Prop({ default: false })
  canDelete: boolean;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);