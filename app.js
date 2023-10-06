import path from "path"
import express from "express"
import fetch from "node-fetch"
import env from "dotenv"
import cors from "cors"
import http from 'http'
const __dirname = path.resolve();

env.config()
const app = express();
const server = http.createServer(app)
const port = process.env.PORT
app.use(express.static('public'))
app.use(express.json())
app.use(cors()
)
app.get('/', function (req, res) {
    try {
        res.sendFile("./public/login.html", { root: __dirname })

    } catch (e) {
        res.send(`Error: ${e}`)
    }
})
app.get('/cb', async function (req, res) {
    try {

        res.sendFile("./public/redirect.html", { root: __dirname })

    } catch (e) {
        res.send(`Error: ${e}`)
    }
})
app.get('/accessToken', async function (req, res) {
    try {
        const { code } = req.query
        if (!code) {
            throw new Error('Code is mandatory')
        }
        const reqBody = {
            code,
            client_id: process.env.CLIENTID,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: "http://localhost:5001/redirect.html",
            grant_type: "authorization_code"
        }
        const url = "https://oauth2.googleapis.com/token"
        const response = await fetch(url, {
            method: "POST",
            body: new URLSearchParams(reqBody),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        const resp = await response.json()
        res.json(resp)
    } catch (e) {
        console.log(e)
        res.send(`Error: ${e}`)
    }
})
server.listen(port, () => {
    console.log('server is running on port: ', port)
})