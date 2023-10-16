// This is to create clientId and clientSecret for oidc Server
import accountService from "./account.service.js"
import clientService from "./client.service.js"
import { generateRandomString } from "./strignGenerator.js"
import env from 'dotenv'
env.config()

import connectMongoDb from "../db/connection.js"
async function bootStrapOIDCClient() {
    try {
        await connectMongoDb()
        console.log('Bootstraping client')

        const account = await accountService.set({ username: process.env.APPNAME, password: "oidcapp" })
        const clientId = generateRandomString(8)
        const clientSecret = generateRandomString(32)
        const userInfo = await clientService.set({
            userId: account._id,
            appName: process.env.APPNAME,
            redirect_uris: "http://localhost:3009/api/client-register",
            client_id: clientId,
            client_secret: clientSecret,
            grant_types: ["authorization_code", 'refresh_token', 'client_credentials'],
            scope: 'openid, offline_access profile email'
        })
        console.log({ clientId, clientSecret })
    } catch (e) {
        console.log('Error in bootstraping client', e)
    }

}
bootStrapOIDCClient()