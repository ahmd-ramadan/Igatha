import { ICampaginModel } from '../interfaces';
import { User } from './User';
import { Schema } from 'mongoose';

const campaignSchema = new Schema({
    pilgrimsCount: {
        type: Number,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    commercialRegister: {
        file: { 
            secure_url: String,
            public_id: String
        },     
        image: { 
            secure_url: String,
            public_id: String
        },
    },
    hajjReference: {
        file: { 
            secure_url: String,
            public_id: String
        },  
        image: { 
            secure_url: String,
            public_id: String
        },
    },
});

campaignSchema.pre('validate', function (next) {
    // Check hajjReference
    if (!this.hajjReference || !this.hajjReference.file || !this.hajjReference.image) {
        return next(new Error('أدخل أحد الملفات أو الصورة المطلوبة لتصريح الحج'));
    }
  
    next();
});
  

export const Campaign = User.discriminator<ICampaginModel>('Campaign', campaignSchema);
