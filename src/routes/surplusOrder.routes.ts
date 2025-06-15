import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { surplusOrderCtrl } from '../controllers';
import { isAuthorized, isAuthunticated } from '../middlewares';
import { manageSurplusOrder, toSurplusOrder } from '../access';

const router = Router();

router.use(isAuthunticated);

router.post(
    '/',
    isAuthorized(manageSurplusOrder),
    asyncHandler(surplusOrderCtrl.createSurplusOrder)
)

router.route('/')
    .patch(
        isAuthorized(manageSurplusOrder),
        asyncHandler(surplusOrderCtrl.updateOrderStatus)
    )
    .get(
        isAuthorized(toSurplusOrder),
        asyncHandler(surplusOrderCtrl.getAllOrders)
    )

router.route('/:code')
    .get(
        isAuthorized(toSurplusOrder),
        asyncHandler(surplusOrderCtrl.getOrder)
    )


export { router as surplusOrderRouter };