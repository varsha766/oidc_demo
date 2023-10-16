import path from "path"
import express, { urlencoded } from "express"
import fetch from "node-fetch"
import env from "dotenv"
import cors from "cors"
import http from 'http'
import { Issuer, generators } from 'openid-client'
import fs from "fs"
const __dirname = path.resolve();
env.config()
const app = express();
const server = http.createServer(app)
const port = process.env.PORT
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())


// creating google issuer and client

const issuer = await Issuer.discover('http://localhost:3009')
const client = new issuer.Client({
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
            scope: 'openid',
            code_challenge,
            code_challenge_method: 'S256',
            access_type: 'offline'
        })
        return authorizationUrl
    } catch (e) {
        console.log(e)
    }

}
fetchAuthUrlData()
app.get('/', function (req, res) {
    try {
        res.sendFile("./public/login.html", { root: __dirname })

    } catch (e) {
        res.send(`Error: ${e}`)
    }
})
app.get('/authorizationUrl', async (req, res) => {
    try {
        const authorizationUrl = await fetchAuthUrlData()
        res.json(authorizationUrl)
    } catch (e) {
        res.send(`Error:${e.message}`)
    }
})

// calback and redirect uri should be same
app.get('/cb', async function (req, res) {
    try {
        // const params = client.callbackParams(req)
        // const tokenSet = await client.callback('http://localhost:5001/cb', params, { code_verifier })
        // console.log(tokenSet, "received tokenSet")

        const token = await fetch('http://localhost:3009/token', {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code: req.query.code,
                client_id: process.env.CLIENTID,
                client_secret: process.env.CLIENT_SECRET,
                redirect_uri: "http://localhost:5001/cb",
                grant_type: "authorization_code",
                code_verifier: code_verifier,
                code_challenge_method: "S256"
            })
        })
        const resp = await token.json()
        const accessToken = resp.access_token
        const userinfo = await client.userinfo(accessToken)
        res.json(resp)
    } catch (e) {
        res.send(`Error: ${e}`)
    }
})

app.get('/resource', async function (req, res) {
    try {
        let modifiedHtml
        const htmlFilePath = path.join(__dirname, "public", 'resource.html')
        fs.readFile(htmlFilePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).send('Error reading HTML file')
            }
            modifiedHtml = data
            modifiedHtml = modifiedHtml.replace('{{TITLE}}', 'Resource')
            modifiedHtml = modifiedHtml.replace('{{APIURL}}', 'http://localhost:3006')
            res.setHeader('Content-Type', 'text/html');
            res.send(modifiedHtml)
        })
    } catch (e) {
        res.send(`Error: ${e}`)
    }
})


// app.get('/cb', async function (req, res) {
//     try {
//         console.log('entered in cb')
//         const code = req.query.code
//         if (!code) {
//             const { error, error_description } = req.query
//             throw (`${error} as ${error_description}`)
//         }
//         let modifiedHtml
//         const htmlFilePath = path.join(__dirname, 'public', 'token.html')
//         fs.readFile(htmlFilePath, 'utf8', (err, data) => {
//             if (err) {
//                 return res.status(500).send('Error reading HTML file')
//             }
//             modifiedHtml = data
//             modifiedHtml = modifiedHtml.replace('{{TITLE}}', 'Fetch token')
//             modifiedHtml = modifiedHtml.replace('{{AUTH_SERVER_URL}}', process.env.ISSUER)
//             modifiedHtml = modifiedHtml.replace('{{CODE}}', code)
//             modifiedHtml = modifiedHtml.replace('{{codeVerifier}}', code_verifier)
//             res.setHeader('Content-Type', 'text/html');
//             res.send(modifiedHtml)
//         })
//     } catch (e) {
//         res.send(`Error: ${e}`)
//     }
// })

server.listen(port, () => {
    console.log('server is running on port: ', port)
})