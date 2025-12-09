import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type permissionDetails = Permission & Document;

export class Permission {
 @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AppModule', required: true })
  moduleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SubModule' })
  subModuleId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SubModuleChild' })
  subModuleChildId?: Types.ObjectId;

  @Prop({ default: false })
  canView: boolean;

  @Prop({ default: false })
  canCreate: boolean;

  @Prop({ default: false })
  canUpdate: boolean;

  @Prop({ default: false })
  canDelete: boolean;
}
export const permissionSchemaFile = SchemaFactory.createForClass(Permission);
