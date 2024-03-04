import { InvalidGrant } from 'oidc-provider/lib/helpers/errors'
import filterClaims from 'oidc-provider/lib/helpers/filter_claims'
import dpopValidate from 'oidc-provider/lib/helpers/validate_dpop'
import resolveResource from 'oidc-provider/lib/helpers/resolve_resource'
import { NextFunction, Request, Response } from 'express'
// import * as accountService from '../../services/account-persist.service'

export const gty = 'password'

export const parameters = ['username', 'password', 'resource', 'scope']

export const passwordHandler = async (req: Request, res: Response, next: NextFunction) => {
    console.log('password handler=====================')
    const oidc = req.app.get('oidc')
    const {
        issueRefreshToken,
        conformIdTokenClaims,
        features: {
            userinfo,
            dPoP: { iatTolerance },
            mTLS: { getCertificate },
            resourceIndicators,
        },
        ttl: { Session },
        claims: fullClaims,
        expiresWithSession,
    } = oidc.configuration()
    const params = req.body
    if (!params.username || !params.password) {
        res.status(400).json({ error: 'UserName and Password are required parameters' });
        return;
    }


    const doc = { username: "varsha", password: "123456", _id: "12345rrfvm", emailVerified: true, email: "varshakumari370@gmail.com" }//await accountService.get(params.username)
    console.log(doc, "doc===============----------************")
    if (doc.password !== params.password) {
        res.status(400).json({ error: 'Invalid username or password' });
        return;
    }

    const account = await oidc.provider.Account.findAccount(req, params.username)
    console.log(account, "account-------------------------------")
    req['account'] = account
    const session = new oidc.provider.Session({
        accountId: req['account'].accountId,
    })
    session.ensureClientContainer(req['oidc'].client.clientId)
    req['Session'] = session

    const grant = new oidc.provider.Grant({
        clientId: req['oidc'].client.clientId,
        accountId: req['account'].accountId,
        sessionUid: req['session'].uid,
    })

    if (params?.resource) {
        grant.addResourceScope(params?.resource, params.scope)
    } else {
        grant.addOIDCScope(oidc.client.scope)
    }

    req['Grant'] = grant

    await grant.save()

    req['session'].grantIdFor(oidc.client.clientId, grant.jti)

    await session.save(Session)

    const scopeSet = new Set<string>()

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
    }

    password.scope.split(' ').forEach((scope: string) => scopeSet.add(scope))

    let cert: string | undefined
    if (oidc.client.tlsClientCertificateBoundAccessTokens) {
        cert = getCertificate(req)
        if (!cert) {
            throw new InvalidGrant('mutual TLS client certificate not provided')
        }
    }

    const { AccessToken, IdToken, RefreshToken, ReplayDetection } = oidc.provider

    const at = new AccessToken({
        accountId: account.accountId,
        client: oidc.client,
        expiresWithSession: password.expiresWithSession,
        grantId: password.grantId,
        gty,
        sessionUid: password.sessionUid,
        sid: password.sid,
    })

    if (oidc.client.tlsClientCertificateBoundAccessTokens) {
        at.setThumbprint('x5t', cert)
    }

    const dPoP = await dpopValidate(req)

    if (dPoP) {
        const unique = await ReplayDetection.unique(
            oidc.client.clientId,
            dPoP.jti,
            dPoP.iat + iatTolerance,
        )

        if (!unique) new InvalidGrant('DPoP Token Replay detected')

        at.setThumbprint('jkt', dPoP.thumbprint)
    }

    const resource = await resolveResource(req, password, {
        userinfo,
        resourceIndicators,
    })

    if (resource) {
        const resourceServerInfo = await resourceIndicators.getResourceServerInfo(
            req,
            resource,
            oidc.client,
        )
        at.resourceServer = new oidc.provider.ResourceServer(resource, resourceServerInfo)
        at.scope = grant.getResourceScopeFiltered(resource, password.scopes)
    } else {
        at.claims = password.claims
        at.scope = grant.getOIDCScopeFiltered(password.scopes)
    }
    req['AccessToken'] = at
    const accessToken = await at.save()

    let refreshToken: string | undefined
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
            gty,
            nonce: password.nonce,
            resource: password.resource,
            rotations: 0,
            scope: password.scope,
            sessionUid: password.sessionUid,
            sid: password.sid,
        })

        if (oidc.client.tokenEndpointAuthMethod === 'none') {
            if (at.jkt) {
                rt.jkt = at.jkt
            }

            if (oidc.client.tlsClientCertificateBoundAccessTokens) {
                rt['x5t#S256'] = at['x5t#S256']
            }
        }

        req['RefreshToken'] = rt
        refreshToken = await rt.save()
    }

    let idToken: string | undefined
    if (password.scopes.has('openid')) {
        const claims = filterClaims(password.claims, 'id_token', grant)
        const rejected = grant.getRejectedOIDCClaims()
        const token = new IdToken(
            {
                ...(await account.claims('id_token', password.scope, claims, rejected)),
                acr: password.acr,
                amr: password.amr,
                auth_time: password.authTime,
            },
            { req },
        )

        if (conformIdTokenClaims && userinfo.enabled && !at.aud) {
            token.scope = 'openid'
        } else {
            token.scope = grant.getOIDCScopeFiltered(password.scopes)
        }

        token.mask = claims
        token.rejected = rejected

        token.set('nonce', password.nonce)
        token.set('at_hash', accessToken)
        token.set('sid', password.sid)

        idToken = await token.issue({ use: 'idtoken' })
    }

    res.json({
        access_token: accessToken,
        expires_in: at.expiration,
        id_token: idToken,
        refresh_token: refreshToken,
        scope: at.scope,
        token_type: at.tokenType,
    })

    next()
}







