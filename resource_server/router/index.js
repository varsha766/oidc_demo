import { route } from './api.route.js'
import { Router } from 'express'
export function router() {
    const router = Router()
    router.use(route())
    return router
}