import { Router } from 'express'
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { campaignRouter } from './campaign.routes';
import { requestRouter } from './request.routes';
import { kitchenRouter } from './kitchen.routes';
import { supplierRouter } from './supplier.routes';
import { charityRouter } from './charity.routes';
import { productRouter } from './product.routes';
const router = Router();

router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/campaign', campaignRouter)
router.use('/request', requestRouter)
router.use('/kitchen', kitchenRouter)
router.use('/supplier', supplierRouter)
router.use('/charity', charityRouter)
router.use('/product', productRouter)

export default router;