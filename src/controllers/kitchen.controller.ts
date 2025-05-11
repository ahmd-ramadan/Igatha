import { Request, Response } from "express";
import { kitchenService } from "../services";
import { CREATED, OK } from "../utils";
import { AuthenticatedRequest } from "../interfaces";
import { createKitchenSchema, updateCampaignSchema, updateKitchenSchema } from "../validation";

export const kitchenRegister = async (req: Request, res: Response) => { 
    const data = createKitchenSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];

    const { kitchen, token } = await kitchenService.createKitchen({ data, files });

    res.status(CREATED).json({
        success: true,
        message: 'تم إنشاء مركز الإعاشة بنجاح .. تم إرسال طلب الإنضمام إلي الأدمن للمراجعة',
        data: {
            kitchen,
            token
        }
    });
}

export const updateKitchenProfile = async (req: AuthenticatedRequest, res: Response) => {
    console.log('req.body', req.body)
    const kitchenId = req?.user?.userId as string;
    const data = updateKitchenSchema.parse(req.body);
    const files = req.files

    console.log('files', files)

    const { request, kitchen } = await kitchenService.updateKitchen({ kitchenId, data, files })

    res.status(OK).json({ 
        success: true,
        message: request ? 'تم إرسال بعض البيانات للإدارة للمراجعة' : 'تم تحديث بياناتك بنجاح',
        data: {
            request,
            kitchen
        }

    });
};

