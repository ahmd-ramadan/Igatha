import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import { productService } from "../services";
import { createProductSchema, getAllProductsSchema, slugParamsSchema, updateProductSchema } from "../validation";
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

export const getAllProducts = async (req: AuthenticatedRequest, res: Response) => {
    const { page, size, search, fromPrice, toPrice, supplierId } = getAllProductsSchema.parse(req.query);
    const products = await productService.getAllProducts({ page, size, search, fromPrice, toPrice, supplierId });

    res.status(OK).json({
        success: true,
        message: 'تم جلب المنتجات بنجاح',
        data: products
    });
}


