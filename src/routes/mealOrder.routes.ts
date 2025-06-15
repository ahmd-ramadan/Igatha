import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { mealOrderCtrl } from '../controllers';
import { isAuthorized, isAuthunticated } from '../middlewares';
import { accessToMealOrder, manageMealOrder, toMealOrder } from '../access';

const router = Router();

router.use(isAuthunticated);

router.post(
    '/',
    isAuthorized(manageMealOrder),
    asyncHandler(mealOrderCtrl.createMealOrder)
)

router.post(
    '/cancel-order',
    isAuthorized(accessToMealOrder),
    asyncHandler(mealOrderCtrl.cancelOrder)
)

// router.post(
//     '/confirm-order',
//     isAuthorized(accessToMealOrder),
//     asyncHandler(mealOrderCtrl.confirmOrder)
// )

router.route('/')
    .patch(
        isAuthorized(accessToMealOrder),
        asyncHandler(mealOrderCtrl.updateOrderStatus)
    )
    .get(
        isAuthorized(toMealOrder),
        asyncHandler(mealOrderCtrl.getAllOrders)
    )

router.route('/:orderCode')
    .get(
        isAuthorized(toMealOrder),
        asyncHandler(mealOrderCtrl.getOrder)
    )


export { router as mealOrderRouter };