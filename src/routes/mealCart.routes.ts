import { Router } from 'express';
import { mealCartCtrl } from '../controllers';
import { isAuthorized, isAuthunticated, multerMiddleHost } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { manageMealCart } from '../access';

const router = Router();

router.use(
    isAuthunticated,
    isAuthorized(manageMealCart),
)
router.route('/')
    .post(
        asyncHandler(mealCartCtrl.addMealToMealCart)
    )
    .patch(
        asyncHandler(mealCartCtrl.removeMealFromMealCart)
    )
    .delete(
        asyncHandler(mealCartCtrl.clearMealCart)
    )
    .get(
        asyncHandler(mealCartCtrl.getCampaignMealCart)
    )

export { router as mealCartRouter };