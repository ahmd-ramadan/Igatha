"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagination = void 0;
const pagination = ({ page, size }) => {
    const limit = size || 100;
    const skip = (page > 0 ? page - 1 : 0) * size;
    return { limit, skip };
};
exports.pagination = pagination;
