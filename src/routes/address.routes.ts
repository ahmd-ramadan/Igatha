import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { addressCtrl } from '../controllers';
import { isAuthorized, isAuthunticated } from '../middlewares';
import { manageAddress } from '../access';

const router = Router();

router.use(
    isAuthunticated,
    isAuthorized(manageAddress),
)
    
router.route('/')
    .post(
        asyncHandler(addressCtrl.createAddress)
    )
    .get(
        asyncHandler(addressCtrl.getAllAddressesForUser)
    )

router
    .route('/:_id')
    .patch(
        asyncHandler(addressCtrl.updateAddress)
    )
    // .delete (
    //     asyncHandler(addressCtrl.deleteAddress)
    // )
    // .get(
    //     asyncHandler(addressCtrl.getAddress)
    // )


export { router as addressRouter };