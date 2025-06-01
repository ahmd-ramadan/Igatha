"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productSubOrderRouter = void 0;
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const access_1 = require("../access");
const router = (0, express_1.Router)();
exports.productSubOrderRouter = router;
router.use(middlewares_1.isAuthunticated);
router.get('/', (0, middlewares_1.isAuthorized)(access_1.accessToProductSubOrder), (0, express_async_handler_1.default)(controllers_1.productSubOrderCtrl.getAllOrders));
router.get('/by-code/:orderCode', (0, middlewares_1.isAuthorized)(access_1.manageProductSubOrder), (0, express_async_handler_1.default)(controllers_1.productSubOrderCtrl.getOrderByCode));
router.get('/by-id/:_id', (0, middlewares_1.isAuthorized)(access_1.manageProductSubOrder), (0, express_async_handler_1.default)(controllers_1.productSubOrderCtrl.getOrderById));
router.patch('/:_id', (0, middlewares_1.isAuthorized)(access_1.manageProductSubOrder), (0, express_async_handler_1.default)(controllers_1.productSubOrderCtrl.updateOrderStatus));
