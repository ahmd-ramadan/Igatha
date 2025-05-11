import { Router } from 'express';
import { requestCtrl } from '../controllers';
import { isAuthorized, isAuthunticated, multerMiddleHost } from '../middlewares';
import asyncHandler from 'express-async-handler'
import { accessOnRequest, getRequest, manageRequest } from '../access';
const router = Router();

router.route('/')
    .get(
        isAuthunticated,  
        isAuthorized(getRequest),
        asyncHandler(requestCtrl.getAllRequests)
    )

router
    .route('/:_id')
    .patch(
        isAuthunticated,
        isAuthorized(manageRequest),
        asyncHandler(requestCtrl.updateRequest)
    )
    .delete(
        isAuthunticated,
        isAuthorized(manageRequest),
        asyncHandler(requestCtrl.deleteRequest)
    )

router.post('/:_id/approve',
        isAuthunticated,
        isAuthorized(accessOnRequest),
        asyncHandler(requestCtrl.approveOnRequest)
    )

router.post('/:_id/reject',
        isAuthunticated,
        isAuthorized(accessOnRequest),
        asyncHandler(requestCtrl.rejectOnRequest)
    )

export { router as requestRouter };