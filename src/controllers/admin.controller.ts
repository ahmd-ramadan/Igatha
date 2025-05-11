// import { Request, Response } from "express";
// import { updateRequestService } from "../services";
// import { OK } from "../utils";
// import { AuthenticatedRequest } from "../interfaces";
// import asyncHandler from "express-async-handler";

// export const getAllPendingUpdateRequests = async (req: Request, res: Response) => {
//     const updateRequests = await updateRequestService.getAllPendingUpdateRequests();
    
//     res.status(OK).json({
//         success: true,
//         data: updateRequests
//     });
// };

// export const approveUpdateRequest = async (req: AuthenticatedRequest, res: Response) => {
//     const { updateRequestId } = req.params;
//     const adminId = req.user?.userId as string;

//     const updatedRequest = await updateRequestService.approveUpdateRequest(updateRequestId, adminId);

//     res.status(OK).json({
//         success: true,
//         message: 'تم الموافقة على طلب التحديث',
//         data: updatedRequest
//     });
// };

// export const rejectUpdateRequest = async (req: AuthenticatedRequest, res: Response) => {
//     const { updateRequestId } = req.params;
//     const adminId = req.user?.userId as string;
//     const { rejectionReason } = req.body;

//     const updatedRequest = await updateRequestService.rejectUpdateRequest(
//         updateRequestId,
//         adminId,
//         rejectionReason
//     );

//     res.status(OK).json({
//         success: true,
//         message: 'تم رفض طلب التحديث',
//         data: updatedRequest
//     });
// }; 