import { Router } from 'express'
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { campaignRouter } from './campaign.routes';
import { requestRouter } from './request.routes';
import { kitchenRouter } from './kitchen.routes';
const router = Router();

router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/campaign', campaignRouter)
router.use('/request', requestRouter)
router.use('/kitchen', kitchenRouter)

export default router;