import path from "path"
import express, { urlencoded } from "express"
import fetch from "node-fetch"
import env from "dotenv"
import cors from "cors"
import http from 'http'
import { Issuer, generators } from 'openid-client'
import fs from "fs"
const __dirname = path.resolve()

import session from 'express-session'
import { error } from "console"

env.config()
const app = express()
const server = http.createServer(app)

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())
const Session = session({
    secret: process.env.Session_secret,
    resave: false,
    saveUninitialized: true
})
const issuer = await Issuer.discover('http://localhost:3009')
const client = new issuer.Client({
    client_id: process.env.CLIENTID,
    client_secret: process.env.CLIENTSECRET,
    redirect_uris: ["http://localhost:3010/cb"],
    response_types: ['code']
})
const code_verifier = generators.codeVerifier()
const code_challenge = generators.codeChallenge(code_verifier);


const port = process.env.PORT || 3010

app.get('/console', Session, async (req, res, next) => {
    try {
        res.sendFile("./public/console.html", { root: __dirname })
    } catch (e) {
        console.log(e)
    }
})
app.get('/cb', Session, async (req, res, next) => {

    try {
        const code = req.query.code
        if (!code) {
            throw (`Error: ${req.query.error} as ${req.query.description}`)
        }
        // const params = client.callbackParams(req)
        // const tokenSet = await client.callback('http://localhost:3009/oidc/cb', params, { code_verifier })
        // console.log(tokenSet, "received token set")
        const token = await fetch('http://localhost:3009/token', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },

            body: new URLSearchParams({
                code: req.query.code,
                client_id: process.env.CLIENTID,
                client_secret: process.env.CLIENTSECRET,
                redirect_uri: "http://localhost:3010/cb",
                grant_type: "authorization_code",
                code_verifier,
                code_challenge_method: "S256"
            })
        })
        const accessToken = await token.json()
        req.session.developerToken = accessToken.access_token
        res.sendFile("./public/console.html", { root: __dirname })
    } catch (e) {
        console.log(e)
    }

})


app.get('/check-session', Session, async (req, res, next) => {
    try {
        const authToken = req.session.developerToken
        if (!authToken) {
            res.send({ message: "No session exists", status: 400 })
        } else {
            const url = "http:///localhost:3009/token/introspection"
            const validateToken = await fetch(url, {
                method: "POST",
                headers: { 'Content-Type': "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    token: authToken,
                    client_id: process.env.CLIENTID,
                    client_secret: process.env.CLIENTSECRET
                })
            })

            const result = await validateToken.json()
            if (!result.active) {
                res.send({ message: "No session exists", status: 400 })

            } else {
                res.json({ authToken })
            }
        }
    } catch (e) {
        throw error(e)
    }
})


app.get('/authorizationUrl', async (req, res, next) => {
    const authorizationUrl = client.authorizationUrl({
        scope: 'openid',
        code_challenge,
        code_challenge_method: 'S256',
        access_type: "offline"
    })
    res.json({ authorizationUrl })
})

server.listen(port, () => {
    console.log('server is running on port: ', port)
})