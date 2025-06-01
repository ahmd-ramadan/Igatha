import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import { addressService } from "../services";
import { CREATED, OK } from "../utils";
import { createAddressSchema, updateAddressSchema } from "../validation/address.validation";
import { paramsSchema } from "../validation";

export const createAddress = async (req: AuthenticatedRequest, res: Response) => {
    const data = createAddressSchema.parse(req.body);
    const userId = req.user?.userId as string;
    const newAdress = await addressService.createNewAddress({ userId, ... data });

    res.status(CREATED).json({
        success: true,
        message: 'تم إنشاء العنوان بنجاح',
        data: newAdress,
    });
};

export const updateAddress = async (req: AuthenticatedRequest, res: Response) => {
    const { _id: addressId } = paramsSchema.parse(req.params);
    const userId = req?.user?.userId as string;
    const data = updateAddressSchema.parse(req.body);

    const updatedAddress = await addressService.updateAddressById({ addressId, data, userId });

    res.status(OK).json({
        success: true,
        message: 'تم تحديث العنوان بنجاح',
        data: updatedAddress,
    });
};

export const getAllAddressesForUser = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const addressesForUser = await addressService.findManyAddressByUserId(userId);

    res.status(OK).json({
        success: true,
        message: 'تم ارجاع كل العنواين الخاصة بك بنجاح',
        data: addressesForUser,
    });
};