import { model, Schema } from "mongoose";
import { IProductCartModel, IProductModel } from "../interfaces"

const productCartSchema = new Schema({
    kitchenId: { 
        type: Schema.Types.ObjectId, 
        ref: "Kitchen",
        required: true
    },
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            note: {
                type: String,
                required: false
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: false
    }
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});


productCartSchema.virtual('kitchenData', {
    ref: 'Kitchen',
    localField: 'kitchenId',
    foreignField: '_id',
    justOne: true,
    options: { 
        select: 'name avatar role rating'
    }  
});

productCartSchema.virtual('productsData', {
    ref: 'Product',
    localField: 'products.productId',
    foreignField: '_id',
    justOne: false,
    options: {
        select: 'appliedPrice images title slug'
    }  
});



export const ProductCart = model<IProductCartModel>("ProductCart", productCartSchema);