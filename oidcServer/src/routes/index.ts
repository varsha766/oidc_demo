import { Router } from 'express'
import { Provider } from 'oidc-provider'
import authRouter from '../routes/auth.router'
export default (oidc: Provider) => {
    const router = Router()
    router.use(authRouter(oidc))
    return router

}