import { model, Schema } from "mongoose";
import { IMealModel, IProductModel } from "../interfaces"

const mealSchema = new Schema({
    kitchenId: { 
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
    appliedPrice: {
        type: Number,
        required: true
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
    minimumOrderQuantity: {
        type: Number,
        required: true
    },
    saleCounter: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

mealSchema.pre('save', function(next) {
    this.appliedPrice = this.price - (this.price * (this.discount || 0) / 100);
    next();
});

mealSchema.virtual('kitchenData', {
    ref: 'Kitchen',
    localField: 'kitchenId',
    foreignField: '_id',
    justOne: true,
    options: { 
        select: 'name avatar role rating'
    }  
});

export const Meal = model<IMealModel>("Meal", mealSchema);