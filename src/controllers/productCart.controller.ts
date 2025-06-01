import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import { addPrdocutToProductCartSchema, removeProductfromProductCartSchema } from "../validation";
import { productCartService } from "../services";
import { OK } from "../utils";

export const addProductToProductCart = async (req: AuthenticatedRequest, res: Response) => {
    const kitchenId = req?.user?.userId as string;
    const { productId, quantity, note } = addPrdocutToProductCartSchema.parse(req.body);

    const productCart = await productCartService.addProductToProductCart({ kitchenId, productId, quantity, note });

    res.status(OK).json({
        success: true,
        message: 'تم إضافة المنتج إلى السلة بنجاح',
        data: productCart
    });
}

export const removeProductFromProductCart = async (req: AuthenticatedRequest, res: Response) => {
    const kitchenId = req?.user?.userId as string;
    const { productId } = removeProductfromProductCartSchema.parse(req.body);

    const productCart = await productCartService.removeProductFromProductCart({ kitchenId, productId });

    res.status(OK).json({
        success: true,
        message: 'تم إزالة المنتج من السلة بنجاح',
        data: productCart
    });
}

export const getKitchenProductCart = async (req: AuthenticatedRequest, res: Response) => {
    const kitchenId = req?.user?.userId as string;

    const productCart = await productCartService.getKitchenProductCart({ kitchenId });

    res.status(OK).json({
        success: true,
        message: 'تم جلب السلة بنجاح',
        data: productCart
    });
}

export const clearProductCart = async (req: AuthenticatedRequest, res: Response) => {
    const kitchenId = req?.user?.userId as string;

    const productCart = await productCartService.clearProductsCart(kitchenId);

    res.status(OK).json({
        success: true,
        message: 'تم إزالة السلة بنجاح',
        data: productCart
    });
}