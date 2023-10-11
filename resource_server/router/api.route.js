import { Router } from 'express';
import { authenticate, authorize } from '../middleware/api.middleware.js'
import { pi } from "../controllers/api.controller.js"
export function route() {
    const router = Router()
    router.get('/pi', authenticate, authorize("openid"), pi)

    return router
}