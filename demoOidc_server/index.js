import express from 'express'
import oidc from 'oidc-provider'
import cors from 'cors'
import { Router, urlencoded } from 'express'
import { strict as assert } from 'node:assert';
import clientService from './services/client.service.js'
import accountService from './services/account.service.js'
import configuration from './configuration.js'
import { errors } from 'oidc-provider';
import connectMongoDb from './db/connection.js'
import path from 'path'
import fs from 'fs'
import env from 'dotenv'
import { generateRandomString } from './services/strignGenerator.js';
env.config()
const __dirname = path.dirname(new URL(import.meta.url).pathname)
const app = express();
const startServer = async () => {
    try {
        await connectMongoDb();
        console.log('db connected successfully')
        const clientInfo = await clientService.getAll()
        const body = urlencoded({ extended: false });
        const { SessionNotFound } = errors;
        app.use(express.static(path.join(__dirname, "public")));
        app.use(express.json())
        app.use(express.urlencoded({ extended: false }));
        app.use(cors({
            origin: '*',
            methods: 'GET,POST',
        }));
        app.get('/client-register', async (req, res, next) => {
            try {
                res.sendFile("./public/client-register.html", { root: __dirname })
            } catch (e) {
                console.log(e)
            }
        })
        app.post('/api/client-register', async (req, res, next) => {
            try {
                const authToken = req.headers.authorizationtoken
                if (!authToken) {
                    throw new Error('You are not authorized.')
                }
                const { userId, appName, appLogoUrl, redirect_uris, grant_types, scope } = req.body
                if (!appName || !userId || !appLogoUrl || !redirect_uris) {
                    throw new Error('All the fields are required')
                }
                const clientId = generateRandomString(8)
                const clientSecret = generateRandomString(32)
                const userInfo = await clientService.set({
                    userId, appName, appLogoUrl, redirect_uris, client_id: clientId, client_secret: clientSecret, grant_types, scope
                })
                res.json({ id: userInfo._id, clientId, clientSecret })
            } catch (e) {
                console.log(e)
                res.json({ message: e.message })
            }
        })
        app.get('/user-register', async (req, res, next) => {
            try {
                res.sendFile("./public/user-register.html", { root: __dirname })
            } catch (e) {
                console.log(e)
            }
        })
        app.post('/api/user-register', async (req, res, next) => {
            try {
                const { name, password } = req.body
                if (!name || !password) {
                    throw new Error('All the fields are required')
                }
                const userInfo = await accountService.set({
                    username: name, password
                })
                res.json({ userId: userInfo._id })
            } catch (e) {
                console.log(e)
            }
        })
        app.get('/interaction/:uid', async (req, res, next) => {
            try {
                const {
                    uid, prompt, params, session,
                } = await provider.interactionDetails(req, res);
                const client = await provider.Client.find(params.client_id);
                switch (prompt.name) {
                    case 'login': {
                        let modifiedHtml
                        const htmlFilePath = path.join(__dirname, "public", 'login.html')
                        fs.readFile(htmlFilePath, 'utf8', (err, data) => {
                            if (err) {
                                return res.sataus(500).send('Error reding HTML file')
                            }
                            modifiedHtml = data
                            modifiedHtml = modifiedHtml.replace('{{TITLE}}', 'Sign-in-oidc server')
                            modifiedHtml = modifiedHtml.replace(/{{UID}}/g, uid)
                            res.setHeader('Content-Type', 'text/html');
                            res.send(modifiedHtml)
                        })
                        break
                    }
                    case 'consent': {
                        let modifiedHtml
                        const htmlFilePath = path.join(__dirname, "public", 'consent.html')
                        fs.readFile(htmlFilePath, 'utf8', (err, data) => {
                            if (err) {
                                return res.sataus(500).send('Error reding HTML file')
                            }
                            modifiedHtml = data
                            modifiedHtml = modifiedHtml.replace('{{TITLE}}', 'Authorize')
                            modifiedHtml = modifiedHtml.replace(/{{UID}}/g, uid)
                            modifiedHtml = modifiedHtml.replace('{{CLIENTID}}', client.clientId)
                            modifiedHtml = modifiedHtml.replace('{{SCOPE}}', "openid")
                            res.send(modifiedHtml)
                        })
                        break
                    }
                    default: return undefined
                }
            } catch (e) {
                return next(e)
            }

        })
        app.post('/interaction/:uid/login', setNoCache, body, async (req, res, next) => {
            try {

                const { prompt: { name } } = await provider.interactionDetails(req, res);
                assert.equal(name, 'login');
                let result;
                const account = await accountService.get(req.body.username);
                if (account?.password === req.body.password) {
                    result = {
                        login: {
                            accountId: account.username,
                        },
                    };
                } else {
                    result = {
                        error: 'access_denied',
                        error_Description: "Username or password is incorrect."
                    }
                }


                await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
            } catch (err) {
                next(err);
            }
        });
        app.post('/interaction/:uid/confirm', setNoCache, body, async (req, res, next) => {
            try {
                const interactionDetails = await provider.interactionDetails(req, res);
                const { prompt: { name, details }, params, session: { accountId } } = interactionDetails;
                assert.equal(name, 'consent');

                let { grantId } = interactionDetails;
                let grant;

                if (grantId) {
                    // we'll be modifying existing grant in existing session
                    grant = await provider.Grant.find(grantId);
                } else {
                    // we're establishing a new grant
                    grant = new provider.Grant({
                        accountId,
                        clientId: params.client_id,
                    });
                }

                if (details.missingOIDCScope) {
                    grant.addOIDCScope(details.missingOIDCScope.join(' '));
                }
                if (details.missingOIDCClaims) {
                    grant.addOIDCClaims(details.missingOIDCClaims);
                }
                if (details.missingResourceScopes) {
                    for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
                        grant.addResourceScope(indicator, scopes.join(' '));
                    }
                }

                grantId = await grant.save();

                const consent = {};
                if (!interactionDetails.grantId) {
                    // we don't have to pass grantId to consent, we're just modifying existing one
                    consent.grantId = grantId;
                }

                const result = { consent };
                await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
            } catch (err) {
                next(err);
            }
        });

        app.get('/interaction/:uid/abort', setNoCache, async (req, res, next) => {
            try {
                console.log('interaction abort')
                const result = {
                    error: 'access_denied',
                    error_description: 'End-User aborted interaction',
                };
                await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
            } catch (err) {
                next(err);
            }
        });
        configuration.clients = clientInfo
        const provider = new oidc('http://localhost:3009', configuration)
        app.use((err, req, res, next) => {
            if (err instanceof SessionNotFound) {
                // handle interaction expired / session not found error
            }
            next(err);
        });
        app.use('', provider.callback())
        app.listen(3009, () => {
            console.log('OIDC is listening on port 3009!')
        })
    } catch (e) {
        console.log(e)
    }
}
startServer()

function setNoCache(req, res, next) {
    res.set('cache-control', 'no-store');
    next();
}

