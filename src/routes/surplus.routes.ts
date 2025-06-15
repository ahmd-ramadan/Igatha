import { Router } from 'express';
import { surplusCtrl } from '../controllers';
import { isAuthorized, isAuthunticated, multerMiddleHost } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { accessOnSurplus, manageSurplus } from '../access';

const router = Router();

router.route('/')
    .post(
        isAuthunticated,
        isAuthorized(manageSurplus),
        multerMiddleHost({}).fields([
            { name: "images", maxCount: 4 },
        ]),
        asyncHandler(surplusCtrl.createSurplus)
    )
    .get(
        asyncHandler(surplusCtrl.getAllSurpluses)
    )



router.route('/:_id')
    .patch(
        isAuthunticated,
        isAuthorized(manageSurplus),
        multerMiddleHost({}).fields([
            { name: "newImages", maxCount: 5 },
            { name: "updatedImages", maxCount: 5 }
        ]),
        asyncHandler(surplusCtrl.updateSurplus)
    )
    .delete(
        isAuthunticated,
        isAuthorized(manageSurplus),
        asyncHandler(surplusCtrl.deleteSurplus)
    )
    .get(
        asyncHandler(surplusCtrl.getSurplus)
    )

router.route('/:_id/note')
    .post(
        isAuthunticated,
        isAuthorized(accessOnSurplus),
        asyncHandler(surplusCtrl.adminAddNoteOnSurplus)
    )

export { router as surplusRouter };