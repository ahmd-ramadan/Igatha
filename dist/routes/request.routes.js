"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const access_1 = require("../access");
const router = (0, express_1.Router)();
exports.requestRouter = router;
router.route('/')
    .get(middlewares_1.isAuthunticated, (0, middlewares_1.isAuthorized)(access_1.getRequest), (0, express_async_handler_1.default)(controllers_1.requestCtrl.getAllRequests));
router
    .route('/:_id')
    .patch(middlewares_1.isAuthunticated, (0, middlewares_1.isAuthorized)(access_1.manageRequest), (0, express_async_handler_1.default)(controllers_1.requestCtrl.updateRequest))
    .delete(middlewares_1.isAuthunticated, (0, middlewares_1.isAuthorized)(access_1.manageRequest), (0, express_async_handler_1.default)(controllers_1.requestCtrl.deleteRequest));
router.post('/:_id/approve', middlewares_1.isAuthunticated, (0, middlewares_1.isAuthorized)(access_1.accessOnRequest), (0, express_async_handler_1.default)(controllers_1.requestCtrl.approveOnRequest));
router.post('/:_id/reject', middlewares_1.isAuthunticated, (0, middlewares_1.isAuthorized)(access_1.accessOnRequest), (0, express_async_handler_1.default)(controllers_1.requestCtrl.rejectOnRequest));
