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
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugService = exports.SlugifyService = void 0;
const utils_1 = require("../utils");
const product_service_1 = require("./product.service");
class SlugifyService {
    constructor() {
        this.slugOptions = {
            replacement: '-',
            lower: true,
            strict: true,
            locale: 'en'
        };
    }
    generateSlug(text, to) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // let newSlug = slug(text, this.slugOptions);
                let newSlug = text.trim().split(' ').join('-');
                let isExist = false;
                if (to === 'product') {
                    isExist = (yield product_service_1.productService.findProductBySlug(newSlug)) ? true : false;
                }
                if (isExist) {
                    newSlug += `-${(0, utils_1.generateUniqueString)({ length: 3, type: 'numbers' })}`;
                }
                return newSlug;
            }
            catch (error) {
                console.log(error);
                throw new utils_1.ApiError('Something wen wrong while generating slug', utils_1.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.SlugifyService = SlugifyService;
exports.slugService = new SlugifyService();
