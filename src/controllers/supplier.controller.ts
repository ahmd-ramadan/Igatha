import { AuthenticatedRequest } from "../interfaces";
import { Request, Response } from "express";
import { createSupplierSchema, updateSupplierSchema } from "../validation";
import { supplierService } from "../services";
import { CREATED, OK } from "../utils";

export const supplierRegister = async (req: Request, res: Response) => { 
    const data = createSupplierSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];

    const { supplier, token } = await supplierService.createSupplier({ data, files });

    res.status(CREATED).json({
        success: true,
        message: 'تم إنشاء حساب المورد بنجاح .. تم إرسال طلب الإنضمام إلي الأدمن للمراجعة',
        data: {
            supplier,
            token
        }
    });
}

export const updateSupplierProfile = async (req: AuthenticatedRequest, res: Response) => {
    console.log('req.body', req.body)
    const supplierId = req?.user?.userId as string;
    const data = updateSupplierSchema.parse(req.body);
    const files = req.files

    console.log('files', files)

    const { request, supplier } = await supplierService.updateSupplier({ supplierId, data, files })

    res.status(OK).json({ 
        success: true,
        message: request ? 'تم إرسال بعض البيانات للإدارة للمراجعة' : 'تم تحديث بياناتك بنجاح',
        data: {
            request,
            supplier
        }

    });
};

