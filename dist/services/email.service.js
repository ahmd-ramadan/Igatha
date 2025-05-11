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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
const utils_1 = require("../utils");
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: config_1.mailService,
            host: config_1.mailHost,
            port: Number(config_1.mailPort),
            secure: false,
            auth: {
                user: config_1.mailAuthUser,
                pass: config_1.mailAuthPassword,
            },
            requireTLS: true,
        });
    }
    sendEmail(args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.transporter.sendMail({
                    from: `Nafsia support <${config_1.mailAuthUser}>`,
                    to: args.to,
                    subject: args.subject,
                    text: args.text,
                    html: args.html,
                });
            }
            catch (error) {
                utils_1.logger.error(`Error sending email - ${error} ❌`);
                throw new Error('Error sending email. Please try again later...');
            }
        });
    }
    sendVerificationEmail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, name, token }) {
            const verifyEmailTemplate = (0, utils_1.getVerifyEmailTemplate)();
            const verifyEmailUrl = `${config_1.clientUrl}/verify-email?token=${token}`;
            const html = verifyEmailTemplate
                .replace(/{{verifyEmailUrl}}/g, verifyEmailUrl)
                .replace(/{{name}}/g, name);
            yield this.sendEmail({
                to: email,
                subject: 'Verify your email',
                text: 'Verify your email',
                html,
            });
        });
    }
    sendForgetPasswordEmail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, name, otp }) {
            const html = (0, utils_1.getOTPTemplate)()
                .replace(/{{otp}}/g, otp)
                .replace(/{{name}}/g, name);
            yield this.sendEmail({
                to: email,
                subject: 'Reset your password',
                text: 'Reset your password',
                html,
            });
        });
    }
}
exports.emailService = new EmailService();
