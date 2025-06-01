import { cloudinaryAvatarsFolder, cloudinarySuppliersFolder } from "../config";
import { RequestTypeEnum, UserRolesEnum } from "../enums";
import { ICloudinaryFile, ICreateSupplierData, ICreateSupplierQuery, IRequest, ISupplierModel } from "../interfaces";
import { supplierRepository } from "../repositories";
import { RequiredMediaAsset } from "../types";
import { ApiError, BAD_REQUEST, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../utils";
import { authService } from "./auth.service";
import { cloudinaryService } from "./cloudinary.service";
import { HashingService } from "./hashing.service";
import { productService } from "./product.service";
import { requestService } from "./request.service";
import { userService } from "./user.service";

class SupplierService {

    constructor(private readonly supplierDataSource = supplierRepository) {}

    async isSupplierExist(supplierId: string) {
        const isSupplierExist = await this.supplierDataSource.findById(supplierId);
        if (!isSupplierExist) {
            throw new ApiError('المورد غير موجود', NOT_FOUND)
        }
        return isSupplierExist;
    }

    async createSupplier({ data, files }: { data: ICreateSupplierQuery, files: any }) {
        try {
            const { email, password } = data;
            const isSupplierExist = await userService.isUserExistByEmail({ 
                email,
                role: UserRolesEnum.SUPPLIER
            });
            if (isSupplierExist) {
                throw new ApiError('هذا البريد الإلكتروني مستخدم بالفعل', CONFLICT)
            }

            let newData: ICreateSupplierData = {
                ... data,
                password: await HashingService.hash(password),
                commercialRegister: {} as RequiredMediaAsset,
                workPermit: {} as RequiredMediaAsset,
            }

            console.log(files)

            if (files) { 
                if(files.avatar) {
                    const avatarImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.avatar[0].path,
                        folderPath: cloudinaryAvatarsFolder 
                    });
                    newData.avatar = avatarImage;
                }
                
                if (!files.commercialRegisterImage && !files.commercialRegisterFile) { 
                    throw new ApiError('يجب عليك رفع صورة أو ملف السجل التجاري', BAD_REQUEST)
                }
                if (files.commercialRegisterFile) {
                    const commercialRegisterFile = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.commercialRegisterFile[0].path,
                        folderPath: cloudinarySuppliersFolder 
                    });
                    newData.commercialRegister = {
                        ... newData.commercialRegister,
                        file: commercialRegisterFile
                    }
                }
                if (files.commercialRegisterImage) {
                    const commercialRegisterImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.commercialRegisterImage[0].path,
                        folderPath: cloudinarySuppliersFolder 
                    });
                    newData.commercialRegister = {
                        ... newData.commercialRegister,
                        image: commercialRegisterImage
                    }
                }
                if (!files.workPermitImage && !files.workPermitFile) {
                    throw new ApiError('يجب عليك رفع صورة أو ملف تصريح العمل', BAD_REQUEST)
                }
                if (files.workPermitFile) {
                    const workPermitFile = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.workPermitFile[0].path,
                        folderPath: cloudinarySuppliersFolder 
                    });
                    newData.workPermit = {
                        ... newData.workPermit,
                        file: workPermitFile
                    }
                }
                if (files.workPermitImage) {
                    const workPermitImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.workPermitImage[0].path,
                        folderPath: cloudinarySuppliersFolder 
                    });
                    newData.workPermit = {
                        ... newData.workPermit,
                        image: workPermitImage
                    }
                }
            }

            console.log(newData);

            const supplier = await this.supplierDataSource.createOne(newData)
            const token = (await authService.generateAndStoreTokens(supplier)).refreshToken;
    
            await authService.sendVerificationEmail(supplier);

            await requestService.createRequest({
                userId: supplier._id,
                role: UserRolesEnum.SUPPLIER,
                currentData: supplier,
                requestedData: newData,
                type: RequestTypeEnum.NEW
            })

            //! notification to the admin with new supplier
            //! notification to the supplier with welcome message

            return { 
                supplier, 
                token
            };
        } catch (error) {
            console.log(error)
            if (error instanceof ApiError) throw error;
            throw new ApiError('حدث خطأ ما اثناء إنشاء المورد', INTERNAL_SERVER_ERROR)
        }
    }

    async updateSupplier({ supplierId, data, files }: { supplierId: string, data: Partial<ICreateSupplierData>, files: any }) {
       try {

            console.log("files",files)

            //! Have request Update 
            const requestIsExist = await requestService.findRequest({ userId: supplierId, role: UserRolesEnum.SUPPLIER, type: RequestTypeEnum.UPDATE })

            const currentSupplier = await this.isSupplierExist(supplierId);
            const updatedData: Partial<ICreateSupplierData> = {}

            // Can UpdatesData 
            if (data.phone) updatedData.phone = data.phone;
            if (files.avatar) {
                const avatarImage = await cloudinaryService.uploadImage({ 
                    fileToUpload: files.avatar[0].path,
                    folderPath: cloudinaryAvatarsFolder 
                });
                updatedData.avatar = avatarImage;
            }

            // Requests Updated Data to Admin
            const requestedUpdatedData: Partial<ICreateSupplierData> = {}
            if (data.name) requestedUpdatedData.name = data.name;
            if (data.address) requestedUpdatedData.address = data.address;

            if(files.commercialRegisterFile) {
                const isSupplierHaveCommercialRegisterFile = requestIsExist?.requestedData?.commercialRegister?.file || undefined;
                if (isSupplierHaveCommercialRegisterFile) {
                    const commercialRegisteFile = await cloudinaryService.updateImage({ 
                        oldPublicId: isSupplierHaveCommercialRegisterFile.public_id,
                        fileToUpload: files.commercialRegisterFile[0].path,
                        folderPath: cloudinarySuppliersFolder 
                    }) as ICloudinaryFile;
                    requestedUpdatedData.commercialRegister = {
                        ... requestedUpdatedData.commercialRegister,
                        file: commercialRegisteFile
                    }
                }
                else {
                    const commercialRegisterFile = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.commercialRegisterFile[0].path,
                        folderPath: cloudinarySuppliersFolder 
                    });
                    requestedUpdatedData.commercialRegister = {
                        ... requestedUpdatedData.commercialRegister,
                        file: commercialRegisterFile
                    }
                }
            }
            if(files.commercialRegisterImage) {
                const isSupplierHaveCommercialRegisterImage = requestIsExist?.requestedData?.commercialRegister?.image || undefined;
                if (isSupplierHaveCommercialRegisterImage) {
                    const commercialRegisterImage = await cloudinaryService.updateImage({ 
                        oldPublicId: isSupplierHaveCommercialRegisterImage.public_id,
                        fileToUpload: files.commercialRegisterImage[0].path,
                        folderPath: cloudinarySuppliersFolder 
                    });
                    requestedUpdatedData.commercialRegister = {
                        ... requestedUpdatedData.commercialRegister,
                        image: commercialRegisterImage
                    }
                }
                else {
                    const commercialRegisterImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.commercialRegisterImage[0].path,
                        folderPath: cloudinarySuppliersFolder 
                    });
                    requestedUpdatedData.commercialRegister = {
                        ... requestedUpdatedData.commercialRegister,
                        image: commercialRegisterImage
                    }
                }
            }
            if(files.workPermitFile) {
                const isSupplierHaveWorkPermitFile = requestIsExist?.requestedData?.workPermit?.file || undefined;  
                if (isSupplierHaveWorkPermitFile) {
                    const workPermitFile = await cloudinaryService.updateImage({ 
                        oldPublicId: isSupplierHaveWorkPermitFile.public_id,
                        fileToUpload: files.workPermitFile[0].path,
                        folderPath: cloudinarySuppliersFolder 
                    }) as ICloudinaryFile;
                    requestedUpdatedData.workPermit = {
                        ... requestedUpdatedData.workPermit,
                        file: workPermitFile
                    }
                }
                else {
                    const workPermitFile = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.workPermitFile[0].path,
                        folderPath: cloudinarySuppliersFolder 
                    });
                    requestedUpdatedData.workPermit = {
                        ... requestedUpdatedData.workPermit,
                        file: workPermitFile
                    }
                }
            }
            if(files.workPermitImage) {
                const isSupplierHaveWorkPermitImage = requestIsExist?.requestedData?.workPermit?.image || undefined;
                if (isSupplierHaveWorkPermitImage) {
                    const workPermitImage = await cloudinaryService.updateImage({
                        oldPublicId: isSupplierHaveWorkPermitImage.public_id,
                        fileToUpload: files.workPermitImage[0].path,
                        folderPath: cloudinarySuppliersFolder 
                    });
                    requestedUpdatedData.workPermit = {
                        ... requestedUpdatedData.workPermit,
                        image: workPermitImage
                    }
                }
                else {
                    const workPermitImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.workPermitImage[0].path,
                        folderPath: cloudinarySuppliersFolder 
                    });
                    requestedUpdatedData.workPermit = {
                        ... requestedUpdatedData.workPermit,
                        image: workPermitImage
                    }
                }
                console.log(files.workPermitImage[0], isSupplierHaveWorkPermitImage)
            }

            // Update supplier data
            const updatedSupplier = await this.supplierDataSource.updateOne({ _id: supplierId }, updatedData);
            if (updatedData.avatar && currentSupplier?.avatar?.public_id) {
                await cloudinaryService.deleteImage(currentSupplier.avatar.public_id)
            }

            // Create update request instead of directly updating
            let request: IRequest | null = requestIsExist || null;
            if (Object.keys(requestedUpdatedData).length > 0) {
                if (requestIsExist) { 
                    requestIsExist.requestedData = requestedUpdatedData;
                    request = await requestService.updateRequest({ requestId: requestIsExist._id, userId: supplierId, data: requestedUpdatedData })
                }  else {
                    request = await requestService.createRequest({
                        userId: supplierId,
                        role: UserRolesEnum.SUPPLIER,
                        currentData: currentSupplier,
                        requestedData: requestedUpdatedData,
                        type: RequestTypeEnum.UPDATE
                    });
                }
            }

            return {
                request,
                supplier: updatedSupplier
            };

        
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('حدث خطأ أثناء إنشاء الطلب', INTERNAL_SERVER_ERROR)
        }
    }

    async updateOne({ supplierId, data }: { supplierId: string, data: Partial<ISupplierModel> }) {
        const { commercialRegister, workPermit } = await this.isSupplierExist(supplierId);
        const updatedSupplier = await this.supplierDataSource.updateOne({ _id: supplierId }, data)

        //! Delete cloudinary previous images
        if (data?.commercialRegister) {
            if (data.commercialRegister?.file && commercialRegister?.file?.public_id) {
                await cloudinaryService.deleteImage(commercialRegister.file.public_id)
            }
            if (data.commercialRegister?.image && commercialRegister?.image?.public_id) {
                await cloudinaryService.deleteImage(commercialRegister.image.public_id)
            }
        }
        if (data?.workPermit) {
            if (data.workPermit?.file && workPermit?.file?.public_id) {
                await cloudinaryService.deleteImage(workPermit.file.public_id)
            }
            if (data.workPermit?.image && workPermit?.image?.public_id) {
                await cloudinaryService.deleteImage(workPermit.image.public_id)
            }
        }

        //! Updated All Product isActive
        const updatedSupplierProducts = await productService.updateMany({
            query: { supplierId },
            data: { isActive: true }
        })
        
        return updatedSupplier;
    }
}

export const supplierService = new SupplierService();