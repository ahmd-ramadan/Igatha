import { Router } from 'express'
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { campaignRouter } from './campaign.routes';
import { requestRouter } from './request.routes';
import { kitchenRouter } from './kitchen.routes';
import { supplierRouter } from './supplier.routes';
import { charityRouter } from './charity.routes';
import { productRouter } from './product.routes';
import { productCartRouter } from './productCart.routes';
import { addressRouter } from './address.routes';
import { productOrderRouter } from './productOrder.routes';
import { productSubOrderRouter } from './prosuctSubOrders.routes';
import { mealRouter } from './meal.routes';
import { mealCartRouter } from './mealCart.routes';
import { mealOrderRouter } from './mealOrder.routes';
import { surplusRouter } from './surplus.routes';
import { surplusOrderRouter } from './surplusOrder.routes';

const router = Router();

router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/campaign', campaignRouter)
router.use('/request', requestRouter)
router.use('/kitchen', kitchenRouter)
router.use('/supplier', supplierRouter)
router.use('/charity', charityRouter)
router.use('/product', productRouter)
router.use('/product-cart', productCartRouter)
router.use('/address', addressRouter)
router.use('/product-order', productOrderRouter)
router.use('/product-suborder', productSubOrderRouter)
router.use('/meal', mealRouter)
router.use('/meal-cart', mealCartRouter)
router.use('/meal-order', mealOrderRouter)
router.use('/surplus', surplusRouter)
router.use('/surplus-order', surplusOrderRouter)

export default router;