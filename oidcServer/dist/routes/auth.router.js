"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const no_cache_middleware_1 = require("../middlewares/no-cache.middleware");
const express_1 = require("express");
const auth_controllers_1 = __importDefault(require("../controllers/auth.controllers"));
exports.default = (oidc) => {
    console.log('inside auth router');
    const router = express_1.Router();
    const { register, login, confirmInteraction, abortInteraction, interaction } = auth_controllers_1.default(oidc);
    router.post('/user', register);
    router.post('/interaction/:uid/login', no_cache_middleware_1.noCache, login);
    router.post('/interaction/:uid/confirm', no_cache_middleware_1.noCache, confirmInteraction);
    router.get('/interaction/:uid/abort', no_cache_middleware_1.noCache, abortInteraction);
    router.get('/interaction/:uid', no_cache_middleware_1.noCache, interaction);
    return router;
};
