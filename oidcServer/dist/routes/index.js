"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_router_1 = __importDefault(require("../routes/auth.router"));
exports.default = (oidc) => {
    const router = express_1.Router();
    router.use(auth_router_1.default(oidc));
    return router;
};
