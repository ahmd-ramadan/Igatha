import { IProductCart } from "../interfaces";
import { productCartRepository } from "../repositories/productCart.repository";
import { ApiError, CONFLICT, INTERNAL_SERVER_ERROR } from "../utils";
import { productService } from "./product.service";


class ProductCartService {

    private readonly populatedArray = ['kitchenData', 'productsData']
    constructor(private readonly productCartDataSource = productCartRepository) {}  

    async isProductCartExists(kitchenId: string) {
        const productCart = await this.findProcuctCartByKitchenId(kitchenId) as IProductCart;
        if (!productCart) {
            throw new ApiError('السلة غير موجودة', CONFLICT);
        }
        return productCart;
    }

    async isProductAvailble({ productId, quantity }: { productId: string, quantity: number }) {
        const product = await productService.isProductExist(productId);
        const { stock, isDeleted, isActive, price, minimumOrderQuantity, title } = product;
        if (isDeleted || !isActive) {
            throw new ApiError(`المنتج ${title} غير متاح الان`, CONFLICT)
        }
        if (stock < quantity) {
            throw new ApiError(`الكمية المطلوبة ${quantity} أكثر من المتاح ${stock} للمنتج ${title}`, CONFLICT);
        }
        return product;
    }

    async findProcuctCartByKitchenId(kitchenId: string) {
        return await this.productCartDataSource.findOneWithPopulate({ kitchenId }, this.populatedArray)
    }

    async addProductToProductCart({ kitchenId, productId, quantity, note }: {kitchenId: string, productId: string, quantity: number, note?: string }) {
        try {
            const { appliedPrice: price } = await this.isProductAvailble({ productId, quantity });

            let productCart = await this.findProcuctCartByKitchenId(kitchenId) as IProductCart;
            if (!productCart) {
                productCart = await this.productCartDataSource.createOne({
                    kitchenId,
                    products: [{ productId, price, quantity, note: note || "" }]
                }) as IProductCart;
            }
            
            let { products, totalPrice } = productCart;
        
            products = products.filter(product => product.productId.toString() !== productId.toString());
            products.push({ productId, price, quantity, note: note || "" });
            totalPrice = products.reduce((acc, product) => acc + product.price * product.quantity, 0);

            const updatedProductCart = await this.productCartDataSource.updateOne({ _id: productCart._id, kitchenId }, { products, totalPrice }, this.populatedArray);

            return updatedProductCart;
        } catch(error) {
            console.log(error)
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء إضافة المنتج إلى السلة', INTERNAL_SERVER_ERROR);
        }
    }

    async removeProductFromProductCart({ kitchenId, productId }: { kitchenId: string, productId: string }) {
        try {
            const productCart = await this.findProcuctCartByKitchenId(kitchenId) as IProductCart;
            if (!productCart) {
                throw new ApiError('السلة غير موجودة', CONFLICT);
            }

            let { products, totalPrice } = productCart;
            products = products.filter(product => product.productId.toString() !== productId.toString());
            totalPrice = products.reduce((acc, product) => acc + product.price * product.quantity, 0);
            
            if (products.length === 0) {
                return await this.clearProductsCart(kitchenId);
            } else {
                const updatedProductCart = await this.productCartDataSource.updateOne({ _id: productCart._id, kitchenId }, { products, totalPrice }, this.populatedArray);
                return updatedProductCart;
            }
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء إزالة المنتج من السلة', INTERNAL_SERVER_ERROR);
        }
    }

    async getKitchenProductCart({ kitchenId }: { kitchenId: string }) {
        try {
            const productCart = await this.findProcuctCartByKitchenId(kitchenId) as IProductCart;
            if (!productCart) {
                throw new ApiError('السلة غير موجودة', CONFLICT);
            }
            return productCart;
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء جلب السلة', INTERNAL_SERVER_ERROR);
        }
    }

    async clearProductsCart(kitchenId: string) {
        try {
            return await this.productCartDataSource.deleteOne({ kitchenId });
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء إزالة السلة', INTERNAL_SERVER_ERROR);
        }
    }
}

export const productCartService = new ProductCartService();