import fetch from 'node-fetch'
import env from 'dotenv'
env.config()
export const authenticate = async (req, res, next) => {
    console.log('entered in authenticate')
    const body = new URLSearchParams()
    if (!req.headers.authorization) return res.status(401).send('Unauthorized');
    body.append('token', req.headers.authorization.replace(/^Bearer /, ''));
    body.append('client_id', process.env.CLIENT_ID)
    body.append('client_secret', process.env.CLIENT_SECRET)
    const url = "http://localhost:3009/token/introspection"
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': "application/x-www-form-urlencoded" },
            body: new URLSearchParams(body)
        })
        const json = await response.json()
        console.log(json, "json")
        console.log(req.originalUrl, "req.originalurl")
        const { active, aud } = json
        // need to check why not able to get aud in json
        // if (active && aud.trim() === req.originalUrl.split('?')[0]) {
        if (active) {
            req.session = json;
            return next();
        } else {
            return res.status(401).send('Unauthorized');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
}
export const authorize = (...scopes) => {
    console.log('entered in authorize')

    return async (req, res, next) => {
        console.log(req.session)

        if (req.session && scopes.every((scope) => req.session.scope.includes(scope))) {
            console.log('if')
            return next()
        } else {
            console.log('else')
            res.status(401).send('Unauthorized')
        }
    }
}