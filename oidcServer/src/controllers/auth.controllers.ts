import { Provider } from 'oidc-provider'

function debug(obj: any) {
    return Object.entries(obj)
        .map((ent: [string, any]) => `<strong>${ent[0]}</strong>: ${JSON.stringify(ent[1])}`)
        .join('<br>')
}
export default (oidc: Provider) => ({
    login: async (req, res) => {
        const { prompt: { name }, } = await oidc.interactionDetails(req, res)
        if (name === 'login') {
            const account = { username: "varsha", password: "123456", _id: "12345rrfvm", emailVerified: true, email: "varshakumari370@gmail.com" }
            let result
            if (account?.password === req.body.password) {
                result = { login: { accountId: req.body.username } }
            } else {
                result = {
                    error: 'access_denied',
                    error_description: 'Username or password is incorrect.',
                }
            }
            return oidc.interactionFinished(req, res, result, {
                mergeWithLastSubmission: false,
            })
        }
    },
    register: async (req, res) => {
        const userDetail = {}
        const body = req.body
        userDetail['username'] = body.username,
            userDetail['password'] = body.password

        res.send({ message: 'user created sucessfully' })
    },
    confirmInteraction: async (req, res) => {
        const interactionDetails
            = await oidc.interactionDetails(req, res)
        const {
            prompt: { name, details },
            params,
            session
        } = interactionDetails
        if (name === 'consent') {
            if (session && session.accountId) {
                const grant = interactionDetails.grantId ? await oidc.Grant.find(interactionDetails.grantId) : new oidc.Grant({
                    accountId: session.accountId,
                    clientId: params.client_id as string
                })

                if (grant) {
                    if (details.missingOIDCScope) {
                        const missingOIDCScope = details.missingOIDCScope as string[]
                        grant.addOIDCScope(missingOIDCScope.join(' '))
                    }
                    if (details.missingOIDCClaims) {
                        const missingOIDCClaims = details.missingOIDCClaims as string[]

                        grant.addOIDCClaims(missingOIDCClaims)
                    }

                    if (details.missingOIDCClaims) {
                        const missingOIDCClaims = details.missingOIDCClaims as string[];
                        grant.addOIDCClaims(missingOIDCClaims);
                    }

                    if (details.missingResourceScopes) {
                        const missingResourceScopes = details.missingResourceScopes as { [indicator: string]: string[] };

                        for (const [indicator, scopes] of Object.entries(missingResourceScopes)) {
                            grant.addResourceScope(indicator, scopes.join(' '));
                        }
                    }
                    const grantId = await grant.save()
                    const result = { consent: { grantId } }
                    await oidc.interactionFinished(req, res, result, {
                        mergeWithLastSubmission: true
                    })
                }
            } else {
                res.send(400, 'Session or accountId not found.');
            }
        } else {
            res.send(400, 'Interaction prompt type must be `consent`.')
        }
    },
    abortInteraction: async (req, res) => {
        const result = {
            error: 'access_denied',
            error_description: 'End-User aborted interaction',
        }
        await oidc.interactionFinished(req, res, result, {
            mergeWithLastSubmission: false,
        })
    },
    interaction: async (req, res) => {
        console.log('inside interaction')
        const { uid, prompt, params, session } = await oidc.interactionDetails(req, res)
        console.log(uid, prompt, params, session)
        if (prompt.name === 'login') {
            res.sendFile(__dirname + '/public/login.html', {
                uid,
                details: prompt.details,
                params,
                session: session ? debug(session) : undefined,
                title: 'Sign-In',
                dbg: {
                    params: debug(params),
                    prompt: debug(prompt),
                },
            })
        } else if (prompt.name === "consent") {
            const scope = params.scope as string
            res.sendFile(__dirname + '/public/consent.html', {
                uid,
                title: "Authorize",
                clientId: params.client_id,
                scope: scope.replace(/ /g, ', '),
                session: session ? debug(session) : undefined,
                dbg: {
                    params: debug(params),
                    prompt: debug(prompt)
                }
            })
        } else {
            res.send(501, "Not implemented")
        }
    }
})