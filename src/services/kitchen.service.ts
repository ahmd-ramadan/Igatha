import { cloudinaryAvatarsFolder, cloudinaryKitchensFolder } from "../config";
import { RequestTypeEnum, UserRolesEnum } from "../enums";
import { ICloudinaryFile, ICreateKitchenData, ICreateKitchenQuery, IKitchenModel, IRequest } from "../interfaces";
import { kitchenRepository } from "../repositories";
import { RequiredMediaAsset } from "../types";
import { ApiError, BAD_REQUEST, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../utils";
import { authService } from "./auth.service";
import { cloudinaryService } from "./cloudinary.service";
import { HashingService } from "./hashing.service";
import { requestService } from "./request.service";
import { userService } from "./user.service";

class KitchenService {

    constructor(private readonly kitchenDataSource = kitchenRepository) {}

    async isKitchenExist(kitchenId: string) {
        const isKitchenExist = await this.kitchenDataSource.findById(kitchenId);
        if (!isKitchenExist) {
            throw new ApiError('مركز الإعاشة غير موجود', NOT_FOUND)
        }
        return isKitchenExist;
    }

    async createKitchen({ data, files }: { data: ICreateKitchenQuery, files: any }) {
        try {
            const { email, password } = data;
            const isKitchenExist = await userService.isUserExistByEmail({ 
                email, 
                role: UserRolesEnum.KITCHEN 
            });
            if (isKitchenExist) {
                throw new ApiError('هذا البريد الإلكتروني مستخدم بالفعل', CONFLICT)
            }

            let newData: ICreateKitchenData = {
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
                        folderPath: cloudinaryKitchensFolder 
                    });
                    newData.commercialRegister = {
                        ... newData.commercialRegister,
                        file: commercialRegisterFile
                    }
                }
                if (files.commercialRegisterImage) {
                    const commercialRegisterImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.commercialRegisterImage[0].path,
                        folderPath: cloudinaryKitchensFolder 
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
                        folderPath: cloudinaryKitchensFolder 
                    });
                    newData.workPermit = {
                        ... newData.workPermit,
                        file: workPermitFile
                    }
                }
                if (files.workPermitImage) {
                    const workPermitImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.workPermitImage[0].path,
                        folderPath: cloudinaryKitchensFolder 
                    });
                    newData.workPermit = {
                        ... newData.workPermit,
                        image: workPermitImage
                    }
                }
            }

            console.log(newData);

            const kitchen = await this.kitchenDataSource.createOne(newData)
            const token = (await authService.generateAndStoreTokens(kitchen)).refreshToken;
    
            await authService.sendVerificationEmail(kitchen);

            await requestService.createRequest({
                userId: kitchen._id,
                role: UserRolesEnum.KITCHEN,
                currentData: kitchen,
                requestedData: newData,
                type: RequestTypeEnum.NEW
            })

            //! notification to the admin with new kitchen
            //! notification to the kitchen with welcome message

            return { 
                kitchen, 
                token
            };
        } catch (error) {
            console.log(error)
            if (error instanceof ApiError) throw error;
            throw new ApiError('حدث خطأ ما اثناء إنشاء مركز الإعاشة', INTERNAL_SERVER_ERROR)
        }
    }

    async updateKitchen({ kitchenId, data, files }: { kitchenId: string, data: Partial<ICreateKitchenData>, files: any }) {
       try {

            console.log("files",files)

            //! Have request Update 
            const requestIsExist = await requestService.findRequest({ userId: kitchenId, role: UserRolesEnum.KITCHEN, type: RequestTypeEnum.UPDATE })

            const currentKitchen = await this.isKitchenExist(kitchenId);
            const updatedData: Partial<ICreateKitchenData> = {}

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
            const requestedUpdatedData: Partial<ICreateKitchenData> = {}
            if (data.name) requestedUpdatedData.name = data.name;
            if (data.address) requestedUpdatedData.address = data.address;

            if(files.commercialRegisterFile) {
                const isKitchenHaveCommercialRegisterFile = requestIsExist?.requestedData?.commercialRegister?.file || undefined;
                if (isKitchenHaveCommercialRegisterFile) {
                    const commercialRegisteFile = await cloudinaryService.updateImage({ 
                        oldPublicId: isKitchenHaveCommercialRegisterFile.public_id,
                        fileToUpload: files.commercialRegisterFile[0].path,
                        folderPath: cloudinaryKitchensFolder 
                    }) as ICloudinaryFile;
                    requestedUpdatedData.commercialRegister = {
                        ... requestedUpdatedData.commercialRegister,
                        file: commercialRegisteFile
                    }
                }
                else {
                    const commercialRegisterFile = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.commercialRegisterFile[0].path,
                        folderPath: cloudinaryKitchensFolder 
                    });
                    requestedUpdatedData.commercialRegister = {
                        ... requestedUpdatedData.commercialRegister,
                        file: commercialRegisterFile
                    }
                }
            }
            if(files.commercialRegisterImage) {
                const isKitchenHaveCommercialRegisterImage = requestIsExist?.requestedData?.commercialRegister?.image || undefined;
                if (isKitchenHaveCommercialRegisterImage) {
                    const commercialRegisterImage = await cloudinaryService.updateImage({ 
                        oldPublicId: isKitchenHaveCommercialRegisterImage.public_id,
                        fileToUpload: files.commercialRegisterImage[0].path,
                        folderPath: cloudinaryKitchensFolder 
                    });
                    requestedUpdatedData.commercialRegister = {
                        ... requestedUpdatedData.commercialRegister,
                        image: commercialRegisterImage
                    }
                }
                else {
                    const commercialRegisterImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.commercialRegisterImage[0].path,
                        folderPath: cloudinaryKitchensFolder 
                    });
                    requestedUpdatedData.commercialRegister = {
                        ... requestedUpdatedData.commercialRegister,
                        image: commercialRegisterImage
                    }
                }
            }
            if(files.workPermitFile) {
                const isKitchenHaveWorkPermitFile = requestIsExist?.requestedData?.workPermit?.file || undefined;  
                if (isKitchenHaveWorkPermitFile) {
                    const workPermitFile = await cloudinaryService.updateImage({ 
                        oldPublicId: isKitchenHaveWorkPermitFile.public_id,
                        fileToUpload: files.workPermitFile[0].path,
                        folderPath: cloudinaryKitchensFolder 
                    }) as ICloudinaryFile;
                    requestedUpdatedData.workPermit = {
                        ... requestedUpdatedData.workPermit,
                        file: workPermitFile
                    }
                }
                else {
                    const workPermitFile = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.workPermitFile[0].path,
                        folderPath: cloudinaryKitchensFolder 
                    });
                    requestedUpdatedData.workPermit = {
                        ... requestedUpdatedData.workPermit,
                        file: workPermitFile
                    }
                }
            }
            if(files.workPermitImage) {
                const isKitchenHaveWorkPermitImage = requestIsExist?.requestedData?.workPermit?.image || undefined;
                if (isKitchenHaveWorkPermitImage) {
                    const workPermitImage = await cloudinaryService.updateImage({
                        oldPublicId: isKitchenHaveWorkPermitImage.public_id,
                        fileToUpload: files.workPermitImage[0].path,
                        folderPath: cloudinaryKitchensFolder 
                    });
                    requestedUpdatedData.workPermit = {
                        ... requestedUpdatedData.workPermit,
                        image: workPermitImage
                    }
                }
                else {
                    const workPermitImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.workPermitImage[0].path,
                        folderPath: cloudinaryKitchensFolder 
                    });
                    requestedUpdatedData.workPermit = {
                        ... requestedUpdatedData.workPermit,
                        image: workPermitImage
                    }
                }
                console.log(files.workPermitImage[0], isKitchenHaveWorkPermitImage)
            }

            // Update kitchen data
            const updatedKitchen = await this.kitchenDataSource.updateOne({ _id: kitchenId }, updatedData);
            if (updatedData.avatar && currentKitchen?.avatar?.public_id) {
                await cloudinaryService.deleteImage(currentKitchen.avatar.public_id)
            }
            // Create update request instead of directly updating
            let request: IRequest | null = requestIsExist || null;
            if (Object.keys(requestedUpdatedData).length > 0) {
                if (requestIsExist) { 
                    requestIsExist.requestedData = requestedUpdatedData;
                    request = await requestService.updateRequest({ requestId: requestIsExist._id, userId: kitchenId, data: requestedUpdatedData })
                }  else {
                    request = await requestService.createRequest({
                        userId: kitchenId,
                        role: UserRolesEnum.KITCHEN,
                        currentData: currentKitchen,
                        requestedData: requestedUpdatedData,
                        type: RequestTypeEnum.UPDATE
                    });
                }
            }

            return {
                request,
                kitchen: updatedKitchen
            };

        
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('حدث خطأ أثناء إنشاء الطلب', INTERNAL_SERVER_ERROR)
        }
    }

    async updateOne({ kitchenId, data }: { kitchenId: string, data: Partial<IKitchenModel> }) {
        const { commercialRegister, workPermit } = await this.isKitchenExist(kitchenId);
        const updatedKitchen = await this.kitchenDataSource.updateOne({ _id: kitchenId }, data)

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
        
        return updatedKitchen;
    }
}

export const kitchenService = new KitchenService();