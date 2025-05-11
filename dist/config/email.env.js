"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailAuthPassword = exports.mailAuthUser = exports.mailPort = exports.mailHost = exports.mailService = void 0;
const env_1 = __importDefault(require("./env"));
exports.mailService = (0, env_1.default)('MAIL_SERVICE');
exports.mailHost = (0, env_1.default)('MAIL_HOST');
exports.mailPort = (0, env_1.default)('MAIL_PORT');
exports.mailAuthUser = (0, env_1.default)('MAIL_AUTH_USER');
exports.mailAuthPassword = (0, env_1.default)('MAIL_AUTH_PASSWORD');
