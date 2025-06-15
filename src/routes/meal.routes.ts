import { Router } from 'express';
import { mealCtrl } from '../controllers';
import { isAuthorized, isAuthunticated, multerMiddleHost } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { accessOnMeal, manageMeal } from '../access';

const router = Router();

router.route('/')
    .post(
        isAuthunticated,
        isAuthorized(manageMeal),
        multerMiddleHost({}).fields([
            { name: "images", maxCount: 4 },
        ]),
        asyncHandler(mealCtrl.createMeal)
    )
    .get(
        asyncHandler(mealCtrl.getAllMeals)
    )



router.route('/:slug')
    .patch(
        isAuthunticated,
        isAuthorized(manageMeal),
        multerMiddleHost({}).fields([
            { name: "newImages", maxCount: 5 },
            { name: "updatedImages", maxCount: 5 }
        ]),
        asyncHandler(mealCtrl.updateMeal)
    )
    .delete(
        isAuthunticated,
        isAuthorized(manageMeal),
        asyncHandler(mealCtrl.deleteMeal)
    )
    .get(
        asyncHandler(mealCtrl.getMeal)
    )

router.route('/:slug/note')
    .post(
        isAuthunticated,
        isAuthorized(accessOnMeal),
        asyncHandler(mealCtrl.adminAddNoteOnMeal)
    )

export { router as mealRouter };