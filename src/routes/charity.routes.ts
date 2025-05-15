import { Router } from 'express';
import { charityCtrl } from '../controllers';
import { isAuthorized, isAuthunticated, multerMiddleHost } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { manageCharity } from '../access';

const router = Router();

router.route('/')
    .post(
        multerMiddleHost({}).fields([
            { name: "avatar", maxCount: 1 },
            { name: "workPermitImage", maxCount: 1 },
            { name: "workPermitFile", maxCount: 1 },
        ]),
        asyncHandler(charityCtrl.charityRegister)
    )
    .patch(
        isAuthunticated,
        isAuthorized(manageCharity),
        multerMiddleHost({}).fields([
            { name: "avatar", maxCount: 1 },
            { name: "workPermitImage", maxCount: 1 },
            { name: "workPermitFile", maxCount: 1 },
        ]),
        asyncHandler(charityCtrl.updateCharityProfile)
    )

export { router as charityRouter };