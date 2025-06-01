import { Router } from 'express';
import { campaignCtrl } from '../controllers';
import { isAuthorized, isAuthunticated, multerMiddleHost } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { manageCampaign } from '../access';

const router = Router();

router.route('/')
    .post(
        multerMiddleHost({}).fields([
            { name: "avatar", maxCount: 1 },
            { name: "commercialRegisterImage", maxCount: 1 },
            { name: "commercialRegisterFile", maxCount: 1 },
            { name: "hajjReferenceImage", maxCount: 1 },
            { name: "hajjReferenceFile", maxCount: 1 },
        ]),
        asyncHandler(campaignCtrl.campaignRegister)
    )
    .patch(
        isAuthunticated,
        isAuthorized(manageCampaign),
        multerMiddleHost({}).fields([
            { name: "avatar", maxCount: 1 },
            { name: "commercialRegisterImage", maxCount: 1 },
            { name: "commercialRegisterFile", maxCount: 1 },
            { name: "hajjReferenceImage", maxCount: 1 },
            { name: "hajjReferenceFile", maxCount: 1 },
        ]),
        asyncHandler(campaignCtrl.updateCampaignProfile)
    )

export { router as campaignRouter };