import { Router } from 'express';
import { productCtrl } from '../controllers';
import { isAuthorized, isAuthunticated, multerMiddleHost } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { accessOnProduct, manageProduct } from '../access';

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



router.route('/:slug')
    .patch(
        isAuthunticated,
        isAuthorized(manageProduct),
        multerMiddleHost({}).fields([
            { name: "newImages", maxCount: 5 },
            { name: "updatedImages", maxCount: 5 }
        ]),
        asyncHandler(productCtrl.updateProduct)
    )
    .delete(
        isAuthunticated,
        isAuthorized(manageProduct),
        asyncHandler(productCtrl.deleteProduct)
    )
    .get(
        asyncHandler(productCtrl.getProduct)
    )

router.route('/:slug/note')
    .post(
        isAuthunticated,
        isAuthorized(accessOnProduct),
        asyncHandler(productCtrl.adminAddNoteOnProduct)
    )

export { router as productRouter };