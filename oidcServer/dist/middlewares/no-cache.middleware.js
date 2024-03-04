"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noCache = void 0;
const noCache = (req, res, next) => {
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    next();
};
exports.noCache = noCache;
