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
exports.clearProductCart = exports.getKitchenProductCart = exports.removeProductFromProductCart = exports.addProductToProductCart = void 0;
const validation_1 = require("../validation");
const services_1 = require("../services");
const utils_1 = require("../utils");
const addProductToProductCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const kitchenId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { productId, quantity, note } = validation_1.addPrdocutToProductCartSchema.parse(req.body);
    const productCart = yield services_1.productCartService.addProductToProductCart({ kitchenId, productId, quantity, note });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم إضافة المنتج إلى السلة بنجاح',
        data: productCart
    });
});
exports.addProductToProductCart = addProductToProductCart;
const removeProductFromProductCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const kitchenId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { productId } = validation_1.removeProductfromProductCartSchema.parse(req.body);
    const productCart = yield services_1.productCartService.removeProductFromProductCart({ kitchenId, productId });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم إزالة المنتج من السلة بنجاح',
        data: productCart
    });
});
exports.removeProductFromProductCart = removeProductFromProductCart;
const getKitchenProductCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const kitchenId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const productCart = yield services_1.productCartService.getKitchenProductCart({ kitchenId });
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم جلب السلة بنجاح',
        data: productCart
    });
});
exports.getKitchenProductCart = getKitchenProductCart;
const clearProductCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const kitchenId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const productCart = yield services_1.productCartService.clearProductsCart(kitchenId);
    res.status(utils_1.OK).json({
        success: true,
        message: 'تم إزالة السلة بنجاح',
        data: productCart
    });
});
exports.clearProductCart = clearProductCart;
