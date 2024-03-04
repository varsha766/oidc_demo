import path from "path"
import fetch from 'node-fetch'
import http from 'http'
import env from 'dotenv'
import bodyParser from "body-parser"
import cookieParser from 'cookie-parser'
import router from './routes'
// import helmet from 'helmet'
import express from "express"
import { oidc } from "./config/provider"
import { configuration } from "./config/configuration"
// const __dirname = path.resolve();
env.config()
const app = express()
const server = http.createServer(app)

const provider = oidc(process.env.PUBLIC_OIDC_ISSUER as string, configuration)
// app.use(helmet());
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser())
app.use(express.static('public'));
app.use(router(provider))

app.listen(process.env.PORT, () => {
    console.log(`oidc-provider listening on port ${process.env.PORT}`)
})

