import { Request, Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import { productService } from "../services";
import { adminAddNoteOnProductSchema, createProductSchema, getAllProductsSchema, slugParamsSchema, updateProductSchema } from "../validation";
import { UserStatusEnum } from "../enums";
import { CREATED, OK } from "../utils";


export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
    const data = createProductSchema.parse(req.body);
    const { userId: supplierId, status: supplierStatus } = req?.user as { userId: string, status: UserStatusEnum };
    const files = req.files;

    const product = await productService.createProduct({ supplierStatus, supplierId, data, files });

    res.status(CREATED).json({
        success: true,
        message: 'تم إنشاء المنتج بنجاح',
        data: product
    });
}

export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
    const { slug: productSlug } = slugParamsSchema.parse(req.params);
    const data = updateProductSchema.parse(req.body);
    const supplierId = req?.user?.userId as string;
    const files = req.files;

    const updatedProduct = await productService.updateProduct({ productSlug, supplierId, data, files });

    res.status(OK).json({
        success: true,
        message: 'تم تحديث المنتج بنجاح',
        data: updatedProduct
    });
}

export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
    const { slug: productSlug } = slugParamsSchema.parse(req.params);
    const supplierId = req?.user?.userId as string;

    const deletedProduct = await productService.deleteProduct({ productSlug, supplierId });

    res.status(OK).json({
        success: true,
        message: 'تم حذف المنتج بنجاح',
        data: deletedProduct
    });
}

export const getAllProducts = async (req: Request, res: Response) => {
    const { page, size, search, fromPrice, toPrice, supplierId } = getAllProductsSchema.parse(req.query);
    const products = await productService.getAllProducts({ page, size, search, fromPrice, toPrice, supplierId });

    res.status(OK).json({
        success: true,
        message: 'تم جلب المنتجات بنجاح',
        data: products
    });
}

export const getProduct = async (req: Request, res: Response) => {
    const { slug: productSlug } = slugParamsSchema.parse(req.params);
    const product = await productService.findProductBySlug(productSlug);

    res.status(OK).json({
        success: true,
        message: 'تم جلب المنتج بنجاح',
        data: product
    });
}

export const adminAddNoteOnProduct = async (req: AuthenticatedRequest, res: Response) => {
    const { slug: productSlug } = slugParamsSchema.parse(req.params);
    const { note } = adminAddNoteOnProductSchema.parse(req.body);

    const updatedProduct = await productService.adminAddNoteToProduct({ productSlug, note });

    res.status(OK).json({
        success: true,
        message: 'تم إضافة الملاحظة بنجاح',
        data: updatedProduct
    });
}

