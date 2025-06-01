"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const access_1 = require("../access");
const router = (0, express_1.Router)();
exports.productRouter = router;
router.route('/')
    .post(middlewares_1.isAuthunticated, (0, middlewares_1.isAuthorized)(access_1.manageProduct), (0, middlewares_1.multerMiddleHost)({}).fields([
    { name: "images", maxCount: 4 },
]), (0, express_async_handler_1.default)(controllers_1.productCtrl.createProduct))
    .get((0, express_async_handler_1.default)(controllers_1.productCtrl.getAllProducts));
router.route('/:slug')
    .patch(middlewares_1.isAuthunticated, (0, middlewares_1.isAuthorized)(access_1.manageProduct), (0, middlewares_1.multerMiddleHost)({}).fields([
    { name: "newImages", maxCount: 5 },
    { name: "updatedImages", maxCount: 5 }
]), (0, express_async_handler_1.default)(controllers_1.productCtrl.updateProduct))
    .delete(middlewares_1.isAuthunticated, (0, middlewares_1.isAuthorized)(access_1.manageProduct), (0, express_async_handler_1.default)(controllers_1.productCtrl.deleteProduct))
    .get((0, express_async_handler_1.default)(controllers_1.productCtrl.getProduct));
router.route('/:slug/note')
    .post(middlewares_1.isAuthunticated, (0, middlewares_1.isAuthorized)(access_1.accessOnProduct), (0, express_async_handler_1.default)(controllers_1.productCtrl.adminAddNoteOnProduct));
