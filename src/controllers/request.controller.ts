import { Response } from "express";
import { OK } from "../utils";
import { AuthenticatedRequest } from "../interfaces";
import { requestService } from "../services";
import { getAllRequestsSchema, paginationSchema, paramsSchema, rejectOnRequestSchema, updateRequestSchema } from "../validation";
import { UserRolesEnum } from "../enums";

export const getAllRequests = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.user?.userId as string;
    const role = req?.user?.role as UserRolesEnum;

    let query = getAllRequestsSchema.parse(req.query)
    const { size, page } = paginationSchema.parse(req.query)

    //! To prevent any user see any users requests
    if (role !== UserRolesEnum.ADMIN) {
        query.userId = userId
    }

    const allRequests = await requestService.getAllRequests({ ... query, size, page })

    res.status(OK).json({ 
        success: true,
        message: 'تم إرجاع كل طلبات المستخدمين بنجاح',
        data: allRequests
    });
};

export const approveOnRequest = async (req: AuthenticatedRequest, res: Response) => {
    const { _id: requestId } = paramsSchema.parse(req.params);

    const campaign = await requestService.approveOnRequest(requestId);

    res.status(OK).json({ 
        success: true,
        message: 'تم الموافقة علي الطلب بنجاح',
        data: campaign 
    });
}

export const rejectOnRequest = async (req: AuthenticatedRequest, res: Response) => {
    const { _id: requestId } = paramsSchema.parse(req.params);
    const { rejectionReason } = rejectOnRequestSchema.parse(req.body);

    const request = await requestService.rejectOnRequest(requestId, rejectionReason);

    res.status(OK).json({ 
        success: true,
        message: 'تم رفض علي الطلب بنجاح',
        data: request 
    });
}

export const deleteRequest = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.user?.userId as string;
    const { _id: requestId } = paramsSchema.parse(req.params);

    const request = await requestService.deleteRequest({ requestId, userId });

    res.status(OK).json({ 
        success: true,
        message: 'تم حذف الطلب بنجاح',
        data: request 
    });
}

export const updateRequest = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req?.user?.userId as string;
    const { _id: requestId } = paramsSchema.parse(req.params);
    const data = updateRequestSchema.parse(req.body);

    const request = await requestService.updateRequest({ requestId, userId, data });

    res.status(OK).json({ 
        success: true,
        message: 'تم تحديث طلبك بنجاح',
        data: request 
    });
}


