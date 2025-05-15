import { Router } from 'express';
import { supplierCtrl } from '../controllers';
import { isAuthorized, isAuthunticated, multerMiddleHost } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { manageSupplier } from '../access';

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
        asyncHandler(supplierCtrl.supplierRegister)
    )
    .patch(
        isAuthunticated,
        isAuthorized(manageSupplier),
        multerMiddleHost({}).fields([
            { name: "avatar", maxCount: 1 },
            { name: "commercialRegisterImage", maxCount: 1 },
            { name: "commercialRegisterFile", maxCount: 1 },
            { name: "workPermitImage", maxCount: 1 },
            { name: "workPermitFile", maxCount: 1 },
        ]),
        asyncHandler(supplierCtrl.updateSupplierProfile)
    )

export { router as supplierRouter };