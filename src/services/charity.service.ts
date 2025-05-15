import { cloudinaryAvatarsFolder, cloudinaryCharitiesFolder } from "../config";
import { RequestTypeEnum, UserRolesEnum } from "../enums";
import { ICharityModel, ICloudinaryFile, ICreateCharityData, ICreateCharityQuery, IRequest } from "../interfaces";
import { charityRepository } from "../repositories";
import { RequiredMediaAsset } from "../types";
import { ApiError, BAD_REQUEST, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../utils";
import { authService } from "./auth.service";
import { cloudinaryService } from "./cloudinary.service";
import { HashingService } from "./hashing.service";
import { requestService } from "./request.service";
import { userService } from "./user.service";

class CharityService {

    constructor(private readonly charityDataSource = charityRepository) {}

    async isCharityExist(charityId: string) {
        const isCharityExist = await this.charityDataSource.findById(charityId);
        if (!isCharityExist) {
            throw new ApiError('الجمعية الخيرية غير موجودة', NOT_FOUND)
        }
        return isCharityExist;
    }

    async createCharity({ data, files }: { data: ICreateCharityQuery, files: any }) {
        try {
            const { email, password } = data;
            const isCharityExist = await userService.isUserExistByEmail({ 
                email,
                role: UserRolesEnum.CHARITY
            });
            if (isCharityExist) {
                throw new ApiError('هذا البريد الإلكتروني مستخدم بالفعل', CONFLICT)
            }

            let newData: ICreateCharityData = {
                ... data,
                password: await HashingService.hash(password),
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
                
                if (!files.workPermitImage && !files.workPermitFile) {
                    throw new ApiError('يجب عليك رفع صورة أو ملف تصريح العمل', BAD_REQUEST)
                }
                if (files.workPermitFile) {
                    const workPermitFile = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.workPermitFile[0].path,
                        folderPath: cloudinaryCharitiesFolder 
                    });
                    newData.workPermit = {
                        ... newData.workPermit,
                        file: workPermitFile
                    }
                }
                if (files.workPermitImage) {
                    const workPermitImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.workPermitImage[0].path,
                        folderPath: cloudinaryCharitiesFolder 
                    });
                    newData.workPermit = {
                        ... newData.workPermit,
                        image: workPermitImage
                    }
                }
            }

            console.log(newData);

            const charity = await this.charityDataSource.createOne(newData)
            const token = (await authService.generateAndStoreTokens(charity)).refreshToken;
    
            await authService.sendVerificationEmail(charity);

            await requestService.createRequest({
                userId: charity._id,
                role: UserRolesEnum.CHARITY,
                currentData: charity,
                requestedData: newData,
                type: RequestTypeEnum.NEW
            })

            //! notification to the admin with new charity
            //! notification to the charity with welcome message

            return { 
                charity, 
                token
            };
        } catch (error) {
            console.log(error)
            if (error instanceof ApiError) throw error;
            throw new ApiError('حدث خطأ ما اثناء إنشاء حساب الجمعية الخيرية', INTERNAL_SERVER_ERROR)
        }
    }

    async updateCharity({ charityId, data, files }: { charityId: string, data: Partial<ICreateCharityData>, files: any }) {
       try {

            console.log("files", files)

            //! Have request Update 
            const requestIsExist = await requestService.findRequest({ userId: charityId, role: UserRolesEnum.CHARITY, type: RequestTypeEnum.UPDATE })

            const currentCharity = await this.isCharityExist(charityId);
            const updatedData: Partial<ICreateCharityData> = {}

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
            const requestedUpdatedData: Partial<ICreateCharityData> = {}
            if (data.name) requestedUpdatedData.name = data.name;
            if (data.address) requestedUpdatedData.address = data.address;

            if(files.workPermitFile) {
                const isCharityHaveWorkPermitFile = requestIsExist?.requestedData?.workPermit?.file || undefined;  
                if (isCharityHaveWorkPermitFile) {
                    const workPermitFile = await cloudinaryService.updateImage({ 
                        oldPublicId: isCharityHaveWorkPermitFile.public_id,
                        fileToUpload: files.workPermitFile[0].path,
                        folderPath: cloudinaryCharitiesFolder 
                    }) as ICloudinaryFile;
                    requestedUpdatedData.workPermit = {
                        ... requestedUpdatedData.workPermit,
                        file: workPermitFile
                    }
                }
                else {
                    const workPermitFile = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.workPermitFile[0].path,
                        folderPath: cloudinaryCharitiesFolder 
                    });
                    requestedUpdatedData.workPermit = {
                        ... requestedUpdatedData.workPermit,
                        file: workPermitFile
                    }
                }
            }
            if(files.workPermitImage) {
                const isCharityHaveWorkPermitImage = requestIsExist?.requestedData?.workPermit?.image || undefined;
                if (isCharityHaveWorkPermitImage) {
                    const workPermitImage = await cloudinaryService.updateImage({
                        oldPublicId: isCharityHaveWorkPermitImage.public_id,
                        fileToUpload: files.workPermitImage[0].path,
                        folderPath: cloudinaryCharitiesFolder 
                    });
                    requestedUpdatedData.workPermit = {
                        ... requestedUpdatedData.workPermit,
                        image: workPermitImage
                    }
                }
                else {
                    const workPermitImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.workPermitImage[0].path,
                        folderPath: cloudinaryCharitiesFolder 
                    });
                    requestedUpdatedData.workPermit = {
                        ... requestedUpdatedData.workPermit,
                        image: workPermitImage
                    }
                }
                console.log(files.workPermitImage[0], isCharityHaveWorkPermitImage)
            }

            // Update charity data
            const updatedCharity = await this.charityDataSource.updateOne({ _id: charityId }, updatedData);
            if (updatedData.avatar && currentCharity?.avatar?.public_id) {
                await cloudinaryService.deleteImage(currentCharity.avatar.public_id)
            }

            // Create update request instead of directly updating
            let request: IRequest | null = requestIsExist || null;
            if (Object.keys(requestedUpdatedData).length > 0) {
                if (requestIsExist) { 
                    requestIsExist.requestedData = requestedUpdatedData;
                    request = await requestService.updateRequest({ requestId: requestIsExist._id, userId: charityId, data: requestedUpdatedData })
                }  else {
                    request = await requestService.createRequest({
                        userId: charityId,
                        role: UserRolesEnum.CHARITY,
                        currentData: currentCharity,
                        requestedData: requestedUpdatedData,
                        type: RequestTypeEnum.UPDATE
                    });
                }
            }

            return {
                request,
                charity: updatedCharity
            };

        
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('حدث خطأ أثناء إنشاء الطلب', INTERNAL_SERVER_ERROR)
        }
    }

    async updateOne({ charityId, data }: { charityId: string, data: Partial<ICharityModel> }) {
        const { workPermit } = await this.isCharityExist(charityId);
        const updatedCharity = await this.charityDataSource.updateOne({ _id: charityId }, data)

        //! Delete cloudinary previous images
        if (data?.workPermit) {
            if (data.workPermit?.file && workPermit?.file?.public_id) {
                await cloudinaryService.deleteImage(workPermit.file.public_id)
            }
            if (data.workPermit?.image && workPermit?.image?.public_id) {
                await cloudinaryService.deleteImage(workPermit.image.public_id)
            }
        }
        
        return this.updateCharity;
    }
}

export const charityService = new CharityService();