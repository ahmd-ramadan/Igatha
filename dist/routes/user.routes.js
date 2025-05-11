"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const access_1 = require("../access");
const router = (0, express_1.Router)();
exports.userRouter = router;
router.route('/')
    .get(middlewares_1.isAuthunticated, (0, middlewares_1.isAuthorized)(access_1.manageUser), (0, express_async_handler_1.default)(controllers_1.userCtrl.getUserProfile))
    .put(middlewares_1.isAuthunticated, (0, middlewares_1.isAuthorized)(access_1.manageUser), (0, express_async_handler_1.default)(controllers_1.userCtrl.updateUserPassword));
router.get('/all', (0, express_async_handler_1.default)(controllers_1.userCtrl.getAllUsers));
