import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenuDocument = Menu & Document;

@Schema({ timestamps: true })
export class Menu {
  @Prop({ required: true })
  title: string;

  // unique stable key used for permissions, sidebar mapping etc.
  @Prop({ required: true, unique: true })
  key: string;

  // 'module' | 'submodule' | 'child'
  @Prop({ required: true })
  type: string;

  @Prop()
  icon?: string;

  @Prop({ default: false })
  children: boolean;

  @Prop({ default: 1 })
  order: number;

  @Prop()
  url?: string;

  // parentId references the same collection for hierarchy; null = root module
  @Prop({ type: Types.ObjectId, ref: 'Menu', default: null })
  parentId: Types.ObjectId | null;

  @Prop({ default: false })
  breadcrumbs: boolean;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
// index already defined via unique:true on @Prop — no need to repeat here
