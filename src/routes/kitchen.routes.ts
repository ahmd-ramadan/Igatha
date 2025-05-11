import { Router } from 'express';
import { kitchenCtrl } from '../controllers';
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
            { name: "workPermitImage", maxCount: 1 },
            { name: "workPermitFile", maxCount: 1 },
        ]),
        asyncHandler(kitchenCtrl.kitchenRegister)
    )
    .patch(
        isAuthunticated,
        isAuthorized(manageCampaign),
        multerMiddleHost({}).fields([
            { name: "avatar", maxCount: 1 },
            { name: "commercialRegisterImage", maxCount: 1 },
            { name: "commercialRegisterFile", maxCount: 1 },
            { name: "workPermitImage", maxCount: 1 },
            { name: "workPermitFile", maxCount: 1 },
        ]),
        asyncHandler(kitchenCtrl.updateKitchenProfile)
    )

export { router as kitchenRouter };