"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressRouter = void 0;
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const access_1 = require("../access");
const router = (0, express_1.Router)();
exports.addressRouter = router;
router.use(middlewares_1.isAuthunticated, (0, middlewares_1.isAuthorized)(access_1.manageAddress));
router.route('/')
    .post((0, express_async_handler_1.default)(controllers_1.addressCtrl.createAddress))
    .get((0, express_async_handler_1.default)(controllers_1.addressCtrl.getAllAddressesForUser));
router
    .route('/:_id')
    .patch((0, express_async_handler_1.default)(controllers_1.addressCtrl.updateAddress));
