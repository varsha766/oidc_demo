import path from "path"
import express from "express"
import fetch from "node-fetch"
import env from "dotenv"
import cors from "cors"
import http from 'http'
import { Issuer, generators } from 'openid-client'
const __dirname = path.resolve();
env.config()
const app = express();
const server = http.createServer(app)
const port = process.env.PORT
app.use(express.static('public'))
app.use(express.json())
app.use(cors())


// creating google issuer and client

const googleIssuers = await Issuer.discover('https://accounts.google.com')
// console.log(googleIssuers)
const client = new googleIssuers.Client({
    client_id: process.env.CLIENTID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: ["http://localhost:5001/cb"],
    response_types: ['code']
})
const code_verifier = generators.codeVerifier()
const code_challenge = generators.codeChallenge(code_verifier);
async function fetchAuthUrlData() {
    try {
        const authorizationUrl = client.authorizationUrl({
            scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar',
            resource: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
            code_challenge,
            code_challenge_method: 'S256',
        })
        return authorizationUrl
    } catch (e) {
        console.log(e)
    }

}
fetchAuthUrlData()
app.get('/', function (req, res) {
    try {
        //res.sendFile("./public/apitest.html", { root: __dirname })
        // res.sendFile("./public/discordButton.html", { root: __dirname })// for discord
        // res.sendFile("./public/github.html", { root: __dirname })
        res.sendFile("./public/studioApitest.html", { root: __dirname })// for discord



    } catch (e) {
        res.send(`Error: ${e}`)
    }
})
app.get('/authorizationUrl', async (req, res) => {
    try {
        console.log('authorizationUrl api')
        const authorizationUrl = await fetchAuthUrlData()
        res.json(authorizationUrl)
    } catch (e) {
        res.send(`Error:${e.message}`)
    }
})
app.get('/cb', async function (req, res) {
    try {
        console.log('cb')
        const params = client.callbackParams(req)
        const tokenSet = await client.callback('http://localhost:5001/cb', params, { code_verifier })
        console.log(tokenSet, "received tokenSet")
        const accessToken = tokenSet.access_token
        const userinfo = await client.userinfo(accessToken)
        console.log(userinfo)
        const clanderList = await client.requestResource("https://www.googleapis.com/calendar/v3/users/me/calendarList", accessToken)
        // console.log(clanderList)
        res.send('Got the user meeting list')
    } catch (e) {
        res.send(`Error: ${e}`)
    }
})

server.listen(port, () => {
    console.log('server is running on port: ', port)
})