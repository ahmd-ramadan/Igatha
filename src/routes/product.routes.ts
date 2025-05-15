import { Router } from 'express';
import { productCtrl } from '../controllers';
import { isAuthorized, isAuthunticated, multerMiddleHost } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { manageProduct } from '../access';

const router = Router();

router.route('/')
    .post(
        isAuthunticated,
        isAuthorized(manageProduct),
        multerMiddleHost({}).fields([
            { name: "images", maxCount: 4 },
        ]),
        asyncHandler(productCtrl.createProduct)
    )
    .get(
        asyncHandler(productCtrl.getAllProducts)
    )



router.route('/:productSlug')
    .patch(
        isAuthunticated,
        isAuthorized(manageProduct),
        multerMiddleHost({}).fields([
            { name: "new", maxCount: 5 },
            { name: "update", maxCount: 5 },
        ]),
        asyncHandler(productCtrl.updateProduct)
    )
    .delete(
        isAuthunticated,
        isAuthorized(manageProduct),
        asyncHandler(productCtrl.deleteProduct)
    )

export { router as productRouter };