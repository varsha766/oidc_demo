"use strict";
// import express, { Request, Response, NextFunction } from 'express';
// import { Provider } from 'oidc-provider';
// import { InvalidGrant } from 'oidc-provider/lib/helpers/errors'
// // import { Presence } from 'oidc-provider/lib/helpers/validate_presence'
// // import * as accountService from '../../services/account-persist.service';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordHandler = exports.parameters = exports.gty = void 0;
// export const gty = 'password';
// export const parameters = ['username', 'password', 'resource', 'scope'];
// export const passwordHandler = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const oidc = req.app.get('oidc'); // Access the OIDC provider instance from the Express app
//         const {
//             issueRefreshToken,
//             conformIdTokenClaims,
//             features: {
//                 userinfo,
//                 dPoP: { iatTolerance },
//                 mTLS: { getCertificate },
//                 resourceIndicators,
//             },
//             ttl: { Session },
//             claims: fullClaims,
//             expiresWithSession,
//         } = oidc.configuration();
//         const params = req.body; // Assuming parameters are sent in the request body
// if (!params.username || !params.password) {
//     throw new Error('UserName and Password are required parameter')
// }
//         const doc = { username: "varsha", password: "123456", _id: "12345rrfvm", emailVerified: true, email: "varshakumari370@gmail.com" }//await accountService.get(params.username);
//         if (doc.password !== params.password) {
//             throw new Error('password grant invalid');
//         }
//         // ... (rest of the logic, similar to the Koa version)
//         // Send the JSON response
//         res.status(200).json({
//             access_token: accessToken,
//             expires_in: at.expiration,
//             id_token: idToken,
//             refresh_token: refreshToken,
//             scope: at.scope,
//             token_type: at.tokenType,
//         });
//     } catch (error) {
//         next(error);
//     }
// };
const errors_1 = require("oidc-provider/lib/helpers/errors");
const filter_claims_1 = __importDefault(require("oidc-provider/lib/helpers/filter_claims"));
const validate_dpop_1 = __importDefault(require("oidc-provider/lib/helpers/validate_dpop"));
const resolve_resource_1 = __importDefault(require("oidc-provider/lib/helpers/resolve_resource"));
// import { Middleware } from 'koa'
// import * as accountService from '../../services/account-persist.service'
exports.gty = 'password';
exports.parameters = ['username', 'password', 'resource', 'scope'];
const passwordHandler = async function (req, next) {
    console.log('password handler=====================');
    const oidc = req.app.get('oidc');
    const { issueRefreshToken, conformIdTokenClaims, features: { userinfo, dPoP: { iatTolerance }, mTLS: { getCertificate }, resourceIndicators, }, ttl: { Session }, claims: fullClaims, expiresWithSession, } = oidc.configuration();
    const params = req.body;
    if (!params.username || !params.password) {
        throw new Error('UserName and Password are required parameter');
    }
    const doc = { username: "varsha", password: "123456", _id: "12345rrfvm", emailVerified: true, email: "varshakumari370@gmail.com" }; //await accountService.get(params.username)
    console.log(doc, "doc===============----------************");
    if (doc.password !== params.password) {
        throw new errors_1.InvalidGrant('password grant invalid');
    }
    // .Account.findAccount(ctx, params.username)
    const account = await oidc.provider.Account.findAccount(req, params.username);
    console.log(account, "account-------------------------------");
    req['account'] = account;
    const session = new oidc.provider.Session({
        accountId: req['account'].accountId,
    });
    session.ensureClientContainer(req['oidc'].client.clientId);
    req['Session'] = session;
    const grant = new oidc.provider.Grant({
        clientId: req['oidc'].client.clientId,
        accountId: req['account'].accountId,
        sessionUid: req['session'].uid,
    });
    if (params?.resource) {
        grant.addResourceScope(params?.resource, params.scope);
    }
    else {
        grant.addOIDCScope(oidc.client.scope);
    }
    req['Grant'] = grant;
    await grant.save();
    req['session'].grantIdFor(oidc.client.clientId, grant.jti);
    await session.save(Session);
    const scopeSet = new Set();
    const password = {
        clientId: grant.clientId,
        grantId: grant.jti,
        accountId: grant.accountId,
        expiresWithSession: await expiresWithSession(req, {
            scopes: scopeSet,
        }),
        sessionUid: session.uid,
        sid: session.authorizations[oidc.client.clientId].sid,
        scopes: scopeSet,
        claims: fullClaims,
        acr: undefined,
        amr: undefined,
        authTime: grant.iat,
        nonce: undefined,
        resource: params?.resource,
        resourceIndicators: new Set([params?.resource]),
        scope: params?.scope ?? oidc.client.scope,
    };
    password.scope.split(' ').forEach((scope) => scopeSet.add(scope));
    let cert;
    if (oidc.client.tlsClientCertificateBoundAccessTokens) {
        cert = getCertificate(req);
        if (!cert) {
            throw new errors_1.InvalidGrant('mutual TLS client certificate not provided');
        }
    }
    const { AccessToken, IdToken, RefreshToken, ReplayDetection } = oidc.provider;
    const at = new AccessToken({
        accountId: account.accountId,
        client: oidc.client,
        expiresWithSession: password.expiresWithSession,
        grantId: password.grantId,
        gty: exports.gty,
        sessionUid: password.sessionUid,
        sid: password.sid,
    });
    if (oidc.client.tlsClientCertificateBoundAccessTokens) {
        at.setThumbprint('x5t', cert);
    }
    const dPoP = await validate_dpop_1.default(req);
    if (dPoP) {
        const unique = await ReplayDetection.unique(oidc.client.clientId, dPoP.jti, dPoP.iat + iatTolerance);
        if (!unique)
            new errors_1.InvalidGrant('DPoP Token Replay detected');
        at.setThumbprint('jkt', dPoP.thumbprint);
    }
    const resource = await resolve_resource_1.default(req, password, {
        userinfo,
        resourceIndicators,
    });
    if (resource) {
        const resourceServerInfo = await resourceIndicators.getResourceServerInfo(req, resource, oidc.client);
        at.resourceServer = new oidc.provider.ResourceServer(resource, resourceServerInfo);
        at.scope = grant.getResourceScopeFiltered(resource, password.scopes);
    }
    else {
        at.claims = password.claims;
        at.scope = grant.getOIDCScopeFiltered(password.scopes);
    }
    req['AccessToken'] = at;
    const accessToken = await at.save();
    let refreshToken;
    if (await issueRefreshToken(req, oidc.client, password)) {
        const rt = new RefreshToken({
            accountId: account.accountId,
            acr: password.acr,
            amr: password.amr,
            authTime: password.authTime,
            claims: password.claims,
            client: oidc.client,
            expiresWithSession: password.expiresWithSession,
            grantId: password.grantId,
            gty: exports.gty,
            nonce: password.nonce,
            resource: password.resource,
            rotations: 0,
            scope: password.scope,
            sessionUid: password.sessionUid,
            sid: password.sid,
        });
        if (oidc.client.tokenEndpointAuthMethod === 'none') {
            if (at.jkt) {
                rt.jkt = at.jkt;
            }
            if (oidc.client.tlsClientCertificateBoundAccessTokens) {
                rt['x5t#S256'] = at['x5t#S256'];
            }
        }
        req['RefreshToken'] = rt;
        refreshToken = await rt.save();
    }
    let idToken;
    if (password.scopes.has('openid')) {
        const claims = filter_claims_1.default(password.claims, 'id_token', grant);
        const rejected = grant.getRejectedOIDCClaims();
        const token = new IdToken({
            ...(await account.claims('id_token', password.scope, claims, rejected)),
            acr: password.acr,
            amr: password.amr,
            auth_time: password.authTime,
        }, { req });
        if (conformIdTokenClaims && userinfo.enabled && !at.aud) {
            token.scope = 'openid';
        }
        else {
            token.scope = grant.getOIDCScopeFiltered(password.scopes);
        }
        token.mask = claims;
        token.rejected = rejected;
        token.set('nonce', password.nonce);
        token.set('at_hash', accessToken);
        token.set('sid', password.sid);
        idToken = await token.issue({ use: 'idtoken' });
    }
    req.body = {
        access_token: accessToken,
        expires_in: at.expiration,
        id_token: idToken,
        refresh_token: refreshToken,
        scope: at.scope,
        token_type: at.tokenType,
    };
    await next();
};
exports.passwordHandler = passwordHandler;
