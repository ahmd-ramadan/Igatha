"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productOrderRouter = void 0;
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const access_1 = require("../access");
const router = (0, express_1.Router)();
exports.productOrderRouter = router;
router.use(middlewares_1.isAuthunticated);
router.post('/', (0, middlewares_1.isAuthorized)(access_1.manageProductOrder), (0, express_async_handler_1.default)(controllers_1.productOrderCtrl.createProductOrder));
router.post('/cancel-order', (0, middlewares_1.isAuthorized)(access_1.accessToProductOrder), (0, express_async_handler_1.default)(controllers_1.productOrderCtrl.cancelOrder));
// router.post(
//     '/confirm-order',
//     isAuthorized(accessToProductOrder),
//     asyncHandler(productOrderCtrl.confirmOrder)
// )
router.route('/')
    .patch((0, middlewares_1.isAuthorized)(access_1.manageProductOrder), (0, express_async_handler_1.default)(controllers_1.productOrderCtrl.updateOrderStatus))
    .get((0, middlewares_1.isAuthorized)(access_1.toProductOrder), (0, express_async_handler_1.default)(controllers_1.productOrderCtrl.getAllOrders));
router.route('/:orderCode')
    .get((0, middlewares_1.isAuthorized)(access_1.toProductOrder), (0, express_async_handler_1.default)(controllers_1.productOrderCtrl.getOrder));
