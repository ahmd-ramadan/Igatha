import { Request, Response } from "express";
import { campaignService } from "../services";
import { CREATED, OK } from "../utils";
import { AuthenticatedRequest } from "../interfaces";
import { createCampaignSchema, updateCampaignSchema } from "../validation";

export const campaignRegister = async (req: Request, res: Response) => { 
    const data = createCampaignSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];

    const { campaign, token } = await campaignService.createCampaign({ data, files });

    res.status(CREATED).json({
        success: true,
        message: 'تم إنشاء الحملة بنجاح .. تم إرسال طلب الإنضمام إلي الأدمن للمراجعة',
        data: {
            campaign,
            token
        }
    });
}

export const updateCampaignProfile = async (req: AuthenticatedRequest, res: Response) => {
    console.log('req.body', req.body)
    const campaignId = req?.user?.userId as string;
    const data = updateCampaignSchema.parse(req.body);
    const files = req.files
    console.log('files', files)

        
    const { request, campaign } = await campaignService.updateCampaign({ campaignId, data, files })

    res.status(OK).json({ 
        success: true,
        message: request ? 'تم إرسال بعض البيانات للإدارة للمراجعة' : 'تم تحديث بياناتك بنجاح',
        data: {
            request,
            campaign
        }

    });
};

