import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { productOrderCtrl } from '../controllers';
import { isAuthorized, isAuthunticated } from '../middlewares';
import { accessToProductOrder, manageProductOrder, toProductOrder } from '../access';

const router = Router();

router.use(isAuthunticated);

router.post(
    '/',
    isAuthorized(manageProductOrder),
    asyncHandler(productOrderCtrl.createProductOrder)
)

router.post(
    '/cancel-order',
    isAuthorized(accessToProductOrder),
    asyncHandler(productOrderCtrl.cancelOrder)
)

// router.post(
//     '/confirm-order',
//     isAuthorized(accessToProductOrder),
//     asyncHandler(productOrderCtrl.confirmOrder)
// )

router.route('/')
    .patch(
        isAuthorized(manageProductOrder),
        asyncHandler(productOrderCtrl.updateOrderStatus)
    )
    .get(
        isAuthorized(toProductOrder),
        asyncHandler(productOrderCtrl.getAllOrders)
    )

router.route('/:orderCode')
    .get(
        isAuthorized(toProductOrder),
        asyncHandler(productOrderCtrl.getOrder)
    )


export { router as productOrderRouter };