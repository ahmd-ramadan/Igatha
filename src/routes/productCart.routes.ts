import { Router } from 'express';
import { productCartCtrl, productCtrl } from '../controllers';
import { isAuthorized, isAuthunticated, multerMiddleHost } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { manageProductCart } from '../access';

const router = Router();

router.use(
    isAuthunticated,
    isAuthorized(manageProductCart),
)
router.route('/')
    .post(
        asyncHandler(productCartCtrl.addProductToProductCart)
    )
    .patch(
        asyncHandler(productCartCtrl.removeProductFromProductCart)
    )
    .delete(
        asyncHandler(productCartCtrl.clearProductCart)
    )
    .get(
        asyncHandler(productCartCtrl.getKitchenProductCart)
    )

export { router as productCartRouter };