"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kitchenRouter = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const access_1 = require("../access");
const router = (0, express_1.Router)();
exports.kitchenRouter = router;
router.route('/')
    .post((0, middlewares_1.multerMiddleHost)({}).fields([
    { name: "avatar", maxCount: 1 },
    { name: "commercialRegisterImage", maxCount: 1 },
    { name: "commercialRegisterFile", maxCount: 1 },
    { name: "workPermitImage", maxCount: 1 },
    { name: "workPermitFile", maxCount: 1 },
]), (0, express_async_handler_1.default)(controllers_1.kitchenCtrl.kitchenRegister))
    .patch(middlewares_1.isAuthunticated, (0, middlewares_1.isAuthorized)(access_1.manageKitchen), (0, middlewares_1.multerMiddleHost)({}).fields([
    { name: "avatar", maxCount: 1 },
    { name: "commercialRegisterImage", maxCount: 1 },
    { name: "commercialRegisterFile", maxCount: 1 },
    { name: "workPermitImage", maxCount: 1 },
    { name: "workPermitFile", maxCount: 1 },
]), (0, express_async_handler_1.default)(controllers_1.kitchenCtrl.updateKitchenProfile));
