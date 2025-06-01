import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { productSubOrderCtrl } from '../controllers';
import { isAuthorized, isAuthunticated } from '../middlewares';
import { accessToProductSubOrder, manageProductSubOrder} from '../access';

const router = Router();

router.use(isAuthunticated);

router.get(
    '/',
    isAuthorized(accessToProductSubOrder),
    asyncHandler(productSubOrderCtrl.getAllOrders)
)

router.get(
    '/by-code/:orderCode',
    isAuthorized(manageProductSubOrder),
    asyncHandler(productSubOrderCtrl.getOrderByCode)
)

router.get(
    '/by-id/:_id',
    isAuthorized(manageProductSubOrder),
    asyncHandler(productSubOrderCtrl.getOrderById)
)

router.patch(
    '/:_id',
    isAuthorized(manageProductSubOrder),
    asyncHandler(productSubOrderCtrl.updateOrderStatus)
)

export { router as productSubOrderRouter };