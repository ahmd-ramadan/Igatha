"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productCartService = void 0;
const productCart_repository_1 = require("../repositories/productCart.repository");
const utils_1 = require("../utils");
const product_service_1 = require("./product.service");
class ProductCartService {
    constructor(productCartDataSource = productCart_repository_1.productCartRepository) {
        this.productCartDataSource = productCartDataSource;
        this.populatedArray = ['kitchenData', 'productsData'];
    }
    isProductCartExists(kitchenId) {
        return __awaiter(this, void 0, void 0, function* () {
            const productCart = yield this.findProcuctCartByKitchenId(kitchenId);
            if (!productCart) {
                throw new utils_1.ApiError('السلة غير موجودة', utils_1.CONFLICT);
            }
            return productCart;
        });
    }
    isProductAvailble(_a) {
        return __awaiter(this, arguments, void 0, function* ({ productId, quantity }) {
            const product = yield product_service_1.productService.isProductExist(productId);
            const { stock, isDeleted, isActive, price, minimumOrderQuantity, title } = product;
            if (isDeleted || !isActive) {
                throw new utils_1.ApiError(`المنتج ${title} غير متاح الان`, utils_1.CONFLICT);
            }
            if (stock < quantity) {
                throw new utils_1.ApiError(`الكمية المطلوبة ${quantity} أكثر من المتاح ${stock} للمنتج ${title}`, utils_1.CONFLICT);
            }
            return product;
        });
    }
    findProcuctCartByKitchenId(kitchenId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.productCartDataSource.findOneWithPopulate({ kitchenId }, this.populatedArray);
        });
    }
    addProductToProductCart(_a) {
        return __awaiter(this, arguments, void 0, function* ({ kitchenId, productId, quantity, note }) {
            try {
                const { appliedPrice: price } = yield this.isProductAvailble({ productId, quantity });
                let productCart = yield this.findProcuctCartByKitchenId(kitchenId);
                if (!productCart) {
                    productCart = (yield this.productCartDataSource.createOne({
                        kitchenId,
                        products: [{ productId, price, quantity, note: note || "" }]
                    }));
                }
                let { products, totalPrice } = productCart;
                products = products.filter(product => product.productId.toString() !== productId.toString());
                products.push({ productId, price, quantity, note: note || "" });
                totalPrice = products.reduce((acc, product) => acc + product.price * product.quantity, 0);
                const updatedProductCart = yield this.productCartDataSource.updateOne({ _id: productCart._id, kitchenId }, { products, totalPrice }, this.populatedArray);
                return updatedProductCart;
            }
            catch (error) {
                console.log(error);
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('حدث خطأ أثناء إضافة المنتج إلى السلة', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    removeProductFromProductCart(_a) {
        return __awaiter(this, arguments, void 0, function* ({ kitchenId, productId }) {
            try {
                const productCart = yield this.findProcuctCartByKitchenId(kitchenId);
                if (!productCart) {
                    throw new utils_1.ApiError('السلة غير موجودة', utils_1.CONFLICT);
                }
                let { products, totalPrice } = productCart;
                products = products.filter(product => product.productId.toString() !== productId.toString());
                totalPrice = products.reduce((acc, product) => acc + product.price * product.quantity, 0);
                if (products.length === 0) {
                    return yield this.clearProductsCart(kitchenId);
                }
                else {
                    const updatedProductCart = yield this.productCartDataSource.updateOne({ _id: productCart._id, kitchenId }, { products, totalPrice }, this.populatedArray);
                    return updatedProductCart;
                }
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('حدث خطأ أثناء إزالة المنتج من السلة', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getKitchenProductCart(_a) {
        return __awaiter(this, arguments, void 0, function* ({ kitchenId }) {
            try {
                const productCart = yield this.findProcuctCartByKitchenId(kitchenId);
                if (!productCart) {
                    throw new utils_1.ApiError('السلة غير موجودة', utils_1.CONFLICT);
                }
                return productCart;
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('حدث خطأ أثناء جلب السلة', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    clearProductsCart(kitchenId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.productCartDataSource.deleteOne({ kitchenId });
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('حدث خطأ أثناء إزالة السلة', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.productCartService = new ProductCartService();
