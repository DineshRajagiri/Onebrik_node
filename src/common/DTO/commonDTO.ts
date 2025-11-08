import { Prop } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export abstract class commonDTO {
    @Prop({ type: String, default: function genUUID() {
        return uuidv4()
    }})
    _id: string
    
    @Prop({default:new Date()})
    createdAt: Date

    @Prop({default:new Date()})
    updatedAt: Date
    
    @Prop({ type: String, ref: 'user',})
    createdBy:string;

    @Prop({ type: String, ref: 'user',})
    updatedBy:string;

    @Prop({default:true})
    isActive:boolean

    @Prop({default:false})
    isDeleted:boolean
}