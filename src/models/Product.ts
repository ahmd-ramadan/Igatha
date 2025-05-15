import { model, Schema } from "mongoose";
import { IProductModel } from "../interfaces"

const productSchema = new Schema({
    supplierId: { 
        type: Schema.Types.ObjectId, 
        ref: "Supplier",
        required: true
    },
    title: { 
        type: String, 
        required: true 
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    desc: {  
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    discount: { 
        type: Number, 
        required: false 
    },
    images: [
        {
            secure_url: {
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            },  
        }
    ],
    stock: { 
        type: Number, 
        required: true 
    },
    adminNotes: { 
        type: String, 
        required: false 
    },
    isActive: { 
        type: Boolean, 
        default: false
    },
    isDeleted: { 
        type: Boolean, 
        default: false
    },
    rating: {
        type: Number,
        reqired: true
    },
    minimumQuantity: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false  
});



export const Product = model<IProductModel>("Product", productSchema);