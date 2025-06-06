"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productSubOrderRepository = void 0;
const models_1 = require("../models");
const general_repository_1 = __importDefault(require("./general.repository"));
exports.productSubOrderRepository = new general_repository_1.default(models_1.ProductSubOrder);
