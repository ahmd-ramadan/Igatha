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
exports.productService = void 0;
const config_1 = require("../config");
const enums_1 = require("../enums");
const repositories_1 = require("../repositories");
const utils_1 = require("../utils");
const cloudinary_service_1 = require("./cloudinary.service");
const slugify_service_1 = require("./slugify.service");
class ProductService {
    constructor(productDataSource = repositories_1.productRepository) {
        this.productDataSource = productDataSource;
        this.populatedArray = ['supplierData'];
    }
    isProductExist(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.productDataSource.findOneWithPopulate({ _id: productId }, this.populatedArray);
            if (!product) {
                throw new utils_1.ApiError('المنتج غير موجود', utils_1.NOT_FOUND);
            }
            return product;
        });
    }
    findProductBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.productDataSource.findOneWithPopulate({ slug }, this.populatedArray);
            return product;
        });
    }
    createProduct(_a) {
        return __awaiter(this, arguments, void 0, function* ({ supplierStatus, supplierId, data, files }) {
            var _b;
            try {
                const { title, desc, price, discount, stock, minimumOrderQuantity } = data;
                // Slugify
                const slug = yield slugify_service_1.slugService.generateSlug(title, 'product');
                console.log(supplierStatus);
                // Is suppler Approved
                let isActive = false;
                if (supplierStatus === enums_1.UserStatusEnum.APPROVED) {
                    isActive = true;
                }
                //! Handle Images
                if (!files || !(files === null || files === void 0 ? void 0 : files.images) || ((_b = files === null || files === void 0 ? void 0 : files.images) === null || _b === void 0 ? void 0 : _b.length) <= 0) {
                    throw new utils_1.ApiError('يجب رفع صورة واحدة علي الاقل لهذا المنتج', utils_1.BAD_REQUEST);
                }
                const images = [];
                for (const file of files.images) {
                    const image = yield cloudinary_service_1.cloudinaryService.uploadImage({
                        fileToUpload: file.path,
                        folderPath: config_1.cloudinaryProductsFolder
                    });
                    images.push(image);
                }
                const appliedPrice = price - (price * (discount || 0));
                const product = yield this.productDataSource.createOne({
                    title,
                    slug,
                    desc,
                    price,
                    discount: discount || 0,
                    images,
                    stock,
                    isActive,
                    supplierId,
                    appliedPrice,
                    minimumOrderQuantity,
                }, this.populatedArray);
                return product;
            }
            catch (error) {
                console.log(error);
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('حدث خطأ أثناء إضافة المنتج', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateProduct(_a) {
        return __awaiter(this, arguments, void 0, function* ({ productSlug, supplierId, data, files }) {
            var _b, _c, _d;
            try {
                const { title, desc, price, discount, stock, minimumOrderQuantity, updatedImagesIds, deletedImagesIds } = data;
                const product = yield this.findProductBySlug(productSlug);
                if (!product) {
                    throw new utils_1.ApiError('المنتج غير موجود', utils_1.NOT_FOUND);
                }
                if (product.supplierId.toString() !== supplierId.toString()) {
                    throw new utils_1.ApiError('لا يمكن تحديث هذا المنتج', utils_1.FORBIDDEN);
                }
                const updatedData = {};
                if (title) {
                    updatedData.title = title;
                    updatedData.slug = yield slugify_service_1.slugService.generateSlug(title, 'product');
                }
                if (desc)
                    updatedData.desc = desc;
                if (price)
                    updatedData.price = price;
                if (discount)
                    updatedData.discount = discount;
                if (stock)
                    updatedData.stock = stock;
                if (minimumOrderQuantity)
                    updatedData.minimumOrderQuantity = minimumOrderQuantity;
                //! Images
                let newImages = product.images;
                if (files) {
                    if (deletedImagesIds && (deletedImagesIds === null || deletedImagesIds === void 0 ? void 0 : deletedImagesIds.length) > 0) {
                        if ((deletedImagesIds === null || deletedImagesIds === void 0 ? void 0 : deletedImagesIds.length) > (newImages === null || newImages === void 0 ? void 0 : newImages.length)) {
                            throw new utils_1.ApiError('يجب أن يكون عدد الصور المحذوفة أقل من أو يساوي لعدد الصور الفعلية', utils_1.BAD_REQUEST);
                        }
                        for (const public_id of deletedImagesIds) {
                            yield cloudinary_service_1.cloudinaryService.deleteImage(public_id);
                            newImages = newImages.filter(img => img.public_id !== public_id);
                        }
                    }
                    if ((files === null || files === void 0 ? void 0 : files.updatedImages) && ((_b = files === null || files === void 0 ? void 0 : files.updatedImages) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                        if (!updatedImagesIds || (updatedImagesIds === null || updatedImagesIds === void 0 ? void 0 : updatedImagesIds.length) != ((_c = files === null || files === void 0 ? void 0 : files.updatedImages) === null || _c === void 0 ? void 0 : _c.length)) {
                            throw new utils_1.ApiError('يجب أن يكون عدد الصور المحدثة مساويا لعدد الصور المحدثة', utils_1.BAD_REQUEST);
                        }
                        if (!updatedImagesIds || (updatedImagesIds === null || updatedImagesIds === void 0 ? void 0 : updatedImagesIds.length) > (newImages === null || newImages === void 0 ? void 0 : newImages.length)) {
                            throw new utils_1.ApiError('يجب أن يكون عدد الصور المحدثة أقل من أو يساوي لعدد الصور الفعلية', utils_1.BAD_REQUEST);
                        }
                        for (let i = 0; i < (updatedImagesIds === null || updatedImagesIds === void 0 ? void 0 : updatedImagesIds.length); i++) {
                            const updatedImage = yield cloudinary_service_1.cloudinaryService.updateImage({
                                oldPublicId: updatedImagesIds[i],
                                fileToUpload: files === null || files === void 0 ? void 0 : files.updatedImages[i].path,
                                folderPath: config_1.cloudinaryProductsFolder,
                            });
                            console.log("updatedImage", updatedImage);
                            console.log("newImages", newImages);
                            newImages = newImages.map(img => img.public_id === updatedImagesIds[i] ? updatedImage : img);
                            console.log("newImages", newImages);
                        }
                    }
                    if ((files === null || files === void 0 ? void 0 : files.newImages) && ((_d = files === null || files === void 0 ? void 0 : files.newImages) === null || _d === void 0 ? void 0 : _d.length) > 0) {
                        for (const file of files.newImages) {
                            const image = yield cloudinary_service_1.cloudinaryService.uploadImage({
                                fileToUpload: file.path,
                                folderPath: config_1.cloudinaryProductsFolder,
                            });
                            newImages.push(image);
                        }
                    }
                }
                updatedData.images = newImages;
                const updatedProduct = yield this.productDataSource.updateOne({ _id: product._id, slug: productSlug, supplierId }, updatedData, this.populatedArray);
                return updatedProduct;
            }
            catch (error) {
                console.log(error);
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('حدث خطأ أثناء تحديث المنتج', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    deleteProduct(_a) {
        return __awaiter(this, arguments, void 0, function* ({ productSlug, supplierId }) {
            try {
                const product = yield this.findProductBySlug(productSlug);
                if (!product) {
                    throw new utils_1.ApiError('المنتج غير موجود', utils_1.NOT_FOUND);
                }
                if (product.supplierId.toString() !== supplierId.toString()) {
                    throw new utils_1.ApiError('لا يمكن حذف هذا المنتج', utils_1.FORBIDDEN);
                }
                if (product.isDeleted) {
                    throw new utils_1.ApiError('المنتج محذوف بالفعل', utils_1.BAD_REQUEST);
                }
                const deletedProduct = yield this.productDataSource.updateOne({ _id: product._id, slug: productSlug }, { isDeleted: true, isActive: false }, this.populatedArray);
                return deletedProduct;
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('حدث خطأ أثناء حذف المنتج', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getAllProducts(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page, size, search, fromPrice, toPrice, supplierId }) {
            try {
                const query = {};
                if (search) {
                    query.$or = [
                        { title: { $regex: search, $options: 'i' } },
                        { desc: { $regex: search, $options: 'i' } },
                    ];
                }
                if (fromPrice)
                    query.price = { $gte: fromPrice };
                if (toPrice)
                    query.price = { $lte: toPrice };
                if (supplierId)
                    query.supplierId = supplierId;
                const { skip, limit } = (0, utils_1.pagination)({ page, size });
                const products = yield this.productDataSource.findWithPopulate(query, this.populatedArray, { skip, limit });
                return products;
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('حدث خطأ أثناء جلب المنتجات', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateOne(_a) {
        return __awaiter(this, arguments, void 0, function* ({ query, data }) {
            const updatedProduct = yield this.productDataSource.updateOne(query, data, this.populatedArray);
            return updatedProduct;
        });
    }
    adminAddNoteToProduct(_a) {
        return __awaiter(this, arguments, void 0, function* ({ productSlug, note }) {
            try {
                const isProductExist = yield this.findProductBySlug(productSlug);
                if (!isProductExist) {
                    throw new utils_1.ApiError('المنتج غير موجود', utils_1.NOT_FOUND);
                }
                const updatedProduct = yield this.productDataSource.updateOne({ slug: productSlug, _id: isProductExist._id }, { adminNotes: note }, this.populatedArray);
                //! Send notification for supplier
                return updatedProduct;
            }
            catch (error) {
                if (error instanceof utils_1.ApiError) {
                    throw error;
                }
                throw new utils_1.ApiError('حدث خطأ أثناء إضافة الملاحظة', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateMany(_a) {
        return __awaiter(this, arguments, void 0, function* ({ query, data }) {
            return yield this.productDataSource.updateMany(query, data);
        });
    }
}
exports.productService = new ProductService();
