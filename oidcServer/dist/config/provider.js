"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oidc = void 0;
const oidc_provider_1 = require("oidc-provider");
const oidc = (issuer, configuration) => {
    const provider = new oidc_provider_1.Provider(issuer, configuration);
    //provider.registerGrantType(gty, passwordHandler, parameters)
    return provider;
};
exports.oidc = oidc;
