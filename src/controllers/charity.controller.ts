import { AuthenticatedRequest } from "../interfaces";
import { Request, Response } from "express";
import { createCharitySchema, createSupplierSchema, updateCharitySchema, updateSupplierSchema } from "../validation";
import { charityService, supplierService } from "../services";
import { CREATED, OK } from "../utils";

export const charityRegister = async (req: Request, res: Response) => { 
    const data = createCharitySchema.parse(req.body);
    const files = req.files as Express.Multer.File[];

    const { charity, token } = await charityService.createCharity({ data, files });

    res.status(CREATED).json({
        success: true,
        message: 'تم إنشاء حساب الجمعية الخيرية بنجاح .. تم إرسال طلب الإنضمام إلي الأدمن للمراجعة',
        data: {
            charity,
            token
        }
    });
}

export const updateCharityProfile = async (req: AuthenticatedRequest, res: Response) => {
    console.log('req.body', req.body)
    const charityId = req?.user?.userId as string;
    const data = updateCharitySchema.parse(req.body);
    const files = req.files

    console.log('files', files)

    const { request, charity } = await charityService.updateCharity({ charityId, data, files })

    res.status(OK).json({ 
        success: true,
        message: request ? 'تم إرسال بعض البيانات للإدارة للمراجعة' : 'تم تحديث بياناتك بنجاح',
        data: {
            request,
            charity
        }

    });
};

