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
exports.adminAddNoteOnProduct = exports.getProduct = exports.getAllProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
const services_1 = require("../services");
const validation_1 = require("../validation");
const utils_1 = require("../utils");
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = validation_1.createProductSchema.parse(req.body);
    const { userId: supplierId, status: supplierStatus } = req === null || req === void 0 ? void 0 : req.user;
    const files = req.files;
    const product = yield services_1.productService.createProduct({ supplierStatus, supplierId, data, files });
    res.status(utils_1.CREATED).json({
        success: true,
        message: 'تم إنشاء المنتج بنجاح',
        data: product
    });
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { slug: productSlug } = validation_1.slugParamsSchema.parse(req.params);
    const data = validation_1.updateProductSchema.parse(req.body);
    const supplierId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const files = req.files;
    const updatedProduct = yield services_1.productService.updateProduct({ productSlug, supplierId, data, files });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم تحديث المنتج بنجاح',
        data: updatedProduct
    });
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { slug: productSlug } = validation_1.slugParamsSchema.parse(req.params);
    const supplierId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const deletedProduct = yield services_1.productService.deleteProduct({ productSlug, supplierId });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم حذف المنتج بنجاح',
        data: deletedProduct
    });
});
exports.deleteProduct = deleteProduct;
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, size, search, fromPrice, toPrice, supplierId } = validation_1.getAllProductsSchema.parse(req.query);
    const products = yield services_1.productService.getAllProducts({ page, size, search, fromPrice, toPrice, supplierId });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم جلب المنتجات بنجاح',
        data: products
    });
});
exports.getAllProducts = getAllProducts;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug: productSlug } = validation_1.slugParamsSchema.parse(req.params);
    const product = yield services_1.productService.findProductBySlug(productSlug);
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم جلب المنتج بنجاح',
        data: product
    });
});
exports.getProduct = getProduct;
const adminAddNoteOnProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug: productSlug } = validation_1.slugParamsSchema.parse(req.params);
    const { note } = validation_1.adminAddNoteOnProductSchema.parse(req.body);
    const updatedProduct = yield services_1.productService.adminAddNoteToProduct({ productSlug, note });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم إضافة الملاحظة بنجاح',
        data: updatedProduct
    });
});
exports.adminAddNoteOnProduct = adminAddNoteOnProduct;
