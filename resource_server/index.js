import express from "express";
import { router } from "./router/index.js"
import cors from 'cors'
const app = express()
app.use(cors())
const port = 3006
const route = router()
app.use(route)
app.listen(port, () => {
    console.log(`api listening on port ${port}`)
}) 