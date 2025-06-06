"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortSchema = exports.paginationSchema = void 0;
const zod_1 = require("zod");
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    size: zod_1.z.coerce.number().int().min(1).max(100).default(10),
});
exports.sortSchema = zod_1.z
    .object({
    sortBy: zod_1.z.string().optional(),
    order: zod_1.z.string().optional(),
})
    .refine((data) => {
    var _a, _b;
    return (!data.sortBy && !data.order) ||
        ((_a = data.sortBy) === null || _a === void 0 ? void 0 : _a.split(',').length) === ((_b = data.order) === null || _b === void 0 ? void 0 : _b.split(',').length);
}, {
    message: "يجب أن يكون عدد حقول الترتيب واتجاه الترتيب متساوياً"
});
