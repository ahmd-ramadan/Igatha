"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// export * from './review.access'
__exportStar(require("./user.access"), exports);
__exportStar(require("./campaign.access"), exports);
__exportStar(require("./supplier.access"), exports);
__exportStar(require("./kitchen.access"), exports);
__exportStar(require("./charity.access"), exports);
__exportStar(require("./admin.access"), exports);
__exportStar(require("./guest.access"), exports);
__exportStar(require("./request.access"), exports);
__exportStar(require("./product.access"), exports);
__exportStar(require("./productCart.access"), exports);
__exportStar(require("./productOrder.access"), exports);
__exportStar(require("./productSubOrder.access"), exports);
__exportStar(require("./address.access"), exports);
