import { Provider } from 'oidc-provider'
import { noCache } from '../middlewares/no-cache.middleware'
import { Router } from 'express'
import authController from '../controllers/auth.controllers'
export default (oidc: Provider) => {
    console.log('inside auth router')
    const router = Router()
    const { register, login, confirmInteraction, abortInteraction, interaction } = authController(oidc)
    router.post('/user', register)
    router.post('/interaction/:uid/login', noCache, login)
    router.post('/interaction/:uid/confirm', noCache, confirmInteraction)
    router.get('/interaction/:uid/abort', noCache, abortInteraction)
    router.get('/interaction/:uid', noCache, interaction)
    return router
}