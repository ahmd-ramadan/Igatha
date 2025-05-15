import { ICampaginModel, ICloudinaryFile, ICloudinaryIMage, ICreateCampaignData, ICreateCampaignQuery, IRequest } from "../interfaces";
import { campaignRepository } from "../repositories";
import { ApiError, BAD_REQUEST, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND } from "../utils";
import { cloudinaryService } from "./cloudinary.service";
import { cloudinaryAvatarsFolder, cloudinaryCampaignsFolder } from "../config";
import { userService } from "./user.service";
import { RequestTypeEnum, UserRolesEnum } from "../enums";
import { requestService } from "./request.service";
import { authService } from "./auth.service";
import { RequiredMediaAsset } from "../types";
import { HashingService } from "./hashing.service";

class CampaignService {

    constructor(private readonly campaignDataSource = campaignRepository) {}

    async isCampaignExist(campaignId: string) {
        const isCampaignExist = await this.campaignDataSource.findById(campaignId);
        if (!isCampaignExist) {
            throw new ApiError('هذه الحملة غير موجود', NOT_FOUND)
        }
        return isCampaignExist;
    }

    async createCampaign({ data, files }: { data: ICreateCampaignQuery, files: any }) {
        try {
            const { email, password } = data;
            const isCampaignExist = await userService.isUserExistByEmail({ 
                email, 
                role: UserRolesEnum.CAMPAIGN 
            });
            if (isCampaignExist) {
                throw new ApiError('هذا البريد الإلكتروني مستخدم بالفعل', CONFLICT)
            }

            let newData: ICreateCampaignData = {
                ... data,
                password: await HashingService.hash(password),
                commercialRegister: {} as RequiredMediaAsset,
                hajjReference: {} as RequiredMediaAsset,
            }

            console.log(files)

            if (files) { 
                if(files.avatar) {
                    const avatarImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.avatar[0].path,
                        folderPath: cloudinaryAvatarsFolder 
                    });
                    newData.avatar = {
                        secure_url: avatarImage.secure_url,
                        public_id: avatarImage.public_id
                    }   
                }
                
                if (!files.commercialRegisterImage && !files.commercialRegisterFile) { 
                    throw new ApiError('يجب عليك رفع صورة أو ملف السجل التجاري', BAD_REQUEST)
                }
                if (files.commercialRegisterFile) {
                    const commercialRegisterFile = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.commercialRegisterFile[0].path,
                        folderPath: cloudinaryCampaignsFolder 
                    });
                    newData.commercialRegister = {
                        ... newData.commercialRegister,
                        file: commercialRegisterFile
                    }
                }
                if (files.commercialRegisterImage) {
                    const commercialRegisterImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.commercialRegisterImage[0].path,
                        folderPath: cloudinaryCampaignsFolder 
                    });
                    newData.commercialRegister = {
                        ... newData.commercialRegister,
                        image: commercialRegisterImage
                    }
                }
                if (!files.hajjReferenceImage && !files.hajjReferenceFile) {
                    throw new ApiError('يجب عليك رفع صورة أو ملف تصريح الحج', BAD_REQUEST)
                }
                if (files.hajjReferenceFile) {
                    const hajjReferenceFile = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.hajjReferenceFile[0].path,
                        folderPath: cloudinaryCampaignsFolder 
                    });
                    newData.hajjReference = {
                        ... newData.hajjReference,
                        file: hajjReferenceFile
                    }
                }
                if (files.hajjReferenceImage) {
                    const hajjReferenceImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.hajjReferenceImage[0].path,
                        folderPath: cloudinaryCampaignsFolder 
                    });
                    newData.hajjReference = {
                        ... newData.hajjReference,
                        image: hajjReferenceImage
                    }
                }
            }

            console.log(newData);

            const campaign = await this.campaignDataSource.createOne(newData)
            const token = (await authService.generateAndStoreTokens(campaign)).refreshToken;
    
            await authService.sendVerificationEmail(campaign);

            await requestService.createRequest({
                userId: campaign._id,
                role: UserRolesEnum.CAMPAIGN,
                currentData: campaign,
                requestedData: newData,
                type: RequestTypeEnum.NEW
            })

            //! notification to the admin with new campaign
            //! notification to the campaign with welcome message

            return { 
                campaign, 
                token
            };
        } catch (error) {
            console.log(error)
            if (error instanceof ApiError) throw error;
            throw new ApiError('حدث خطأ ما اثناء إنشاء الحملة', INTERNAL_SERVER_ERROR)
        }
    }

    async updateCampaign({ campaignId, data, files }: { campaignId: string, data: Partial<ICreateCampaignQuery>, files: any }) {
       try {

            console.log("files",files)

            //! Have request Update 
            const requestIsExist = await requestService.findRequest({ userId: campaignId, role: UserRolesEnum.CAMPAIGN, type: RequestTypeEnum.UPDATE })

            const currentCampaign = await this.isCampaignExist(campaignId);
            const updatedData: Partial<ICreateCampaignData> = {}

            // Can UpdatesData 
            if (data.phone) updatedData.phone = data.phone;
            if (files.avatar) {
                const { secure_url, public_id } = await cloudinaryService.uploadImage({ 
                    fileToUpload: files.avatar[0].path,
                    folderPath: cloudinaryAvatarsFolder 
                });
                updatedData.avatar = {
                    secure_url,
                    public_id
                }
            }

            // Requests Updated Data to Admin
            const requestedUpdatedData: Partial<ICreateCampaignData> = {}
            if (data.name) requestedUpdatedData.name = data.name;
            if (data.country) requestedUpdatedData.country = data.country;
            if (data.pilgrimsCount) requestedUpdatedData.pilgrimsCount = data.pilgrimsCount;
            
            if(files.commercialRegisterFile) {
                const isCampaignHaveCommercialRegisterFile = requestIsExist?.requestedData?.commercialRegister?.file || undefined;
                if (isCampaignHaveCommercialRegisterFile) {
                    const commercialRegisteFile = await cloudinaryService.updateImage({ 
                        oldPublicId: isCampaignHaveCommercialRegisterFile.public_id,
                        fileToUpload: files.commercialRegisterFile[0].path,
                        folderPath: cloudinaryCampaignsFolder 
                    }) as ICloudinaryFile;
                    requestedUpdatedData.commercialRegister = {
                        ... requestedUpdatedData.commercialRegister,
                        file: commercialRegisteFile
                    }
                }
                else {
                    const commercialRegisterFile = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.commercialRegisterFile[0].path,
                        folderPath: cloudinaryCampaignsFolder 
                    });
                    requestedUpdatedData.commercialRegister = {
                        ... requestedUpdatedData.commercialRegister,
                        file: commercialRegisterFile
                    }
                }
            }
            if(files.commercialRegisterImage) {
                const isCampaignHaveCommercialRegisterImage = requestIsExist?.requestedData?.commercialRegister?.image || undefined;
                if (isCampaignHaveCommercialRegisterImage) {
                    const commercialRegisterImage = await cloudinaryService.updateImage({ 
                        oldPublicId: isCampaignHaveCommercialRegisterImage.public_id,
                        fileToUpload: files.commercialRegisterImage[0].path,
                        folderPath: cloudinaryCampaignsFolder 
                    });
                    requestedUpdatedData.commercialRegister = {
                        ... requestedUpdatedData.commercialRegister,
                        image: commercialRegisterImage
                    }
                }
                else {
                    const commercialRegisterImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.commercialRegisterImage[0].path,
                        folderPath: cloudinaryCampaignsFolder 
                    });
                    requestedUpdatedData.commercialRegister = {
                        ... requestedUpdatedData.commercialRegister,
                        image: commercialRegisterImage
                    }
                }
            }
            if(files.hajjReferenceFile) {
                const isCampaignHaveHajjReferenceFile = requestIsExist?.requestedData?.hajjReference?.file || undefined;  
                if (isCampaignHaveHajjReferenceFile) {
                    const hajjReferenceFile = await cloudinaryService.updateImage({ 
                        oldPublicId: isCampaignHaveHajjReferenceFile.public_id,
                        fileToUpload: files.hajjReferenceFile[0].path,
                        folderPath: cloudinaryCampaignsFolder 
                    }) as ICloudinaryFile;
                    requestedUpdatedData.hajjReference = {
                        ... requestedUpdatedData.hajjReference,
                        file: hajjReferenceFile
                    }
                }
                else {
                    const hajjReferenceFile = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.hajjReferenceFile[0].path,
                        folderPath: cloudinaryCampaignsFolder 
                    });
                    requestedUpdatedData.hajjReference = {
                        ... requestedUpdatedData.hajjReference,
                        file: hajjReferenceFile
                    }
                }
            }
            if(files.hajjReferenceImage) {
                const isCampaignHaveHajjReferenceImage = requestIsExist?.requestedData?.hajjReference?.image || undefined;
                if (isCampaignHaveHajjReferenceImage) {
                    const hajjReferenceImage = await cloudinaryService.updateImage({
                        oldPublicId: isCampaignHaveHajjReferenceImage.public_id,
                        fileToUpload: files.hajjReferenceImage[0].path,
                        folderPath: cloudinaryCampaignsFolder 
                    });
                    requestedUpdatedData.hajjReference = {
                        ... requestedUpdatedData.hajjReference,
                        image: hajjReferenceImage
                    }
                }
                else {
                    const hajjReferenceImage = await cloudinaryService.uploadImage({ 
                        fileToUpload: files.hajjReferenceImage[0].path,
                        folderPath: cloudinaryCampaignsFolder 
                    });
                    requestedUpdatedData.hajjReference = {
                        ... requestedUpdatedData.hajjReference,
                        image: hajjReferenceImage
                    }
                }
                console.log(files.hajjReferenceImage[0], isCampaignHaveHajjReferenceImage)
            }

            // Update campaign data
            const updatedCampaign = await this.campaignDataSource.updateOne({ _id: campaignId }, updatedData);
            if (updatedData.avatar && currentCampaign?.avatar?.public_id) {
                await cloudinaryService.deleteImage(currentCampaign.avatar.public_id)
            }


            // Create update request instead of directly updating
            let request: IRequest | null = requestIsExist || null;
            if (Object.keys(requestedUpdatedData).length > 0) {
                if (requestIsExist) { 
                    requestIsExist.requestedData = requestedUpdatedData;
                    request = await requestService.updateRequest({ requestId: requestIsExist._id, userId: campaignId, data: requestedUpdatedData })
                }  else {
                    request = await requestService.createRequest({
                        userId: campaignId,
                        role: UserRolesEnum.CAMPAIGN,
                        currentData: currentCampaign,
                        requestedData: requestedUpdatedData,
                        type: RequestTypeEnum.UPDATE
                    });
                }
            }

            return {
                request,
                campaign: updatedCampaign
            };

        
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('حدث خطأ أثناء إنشاء الطلب', INTERNAL_SERVER_ERROR)
        }
    }

    async updateOne({ campaignId, data }: { campaignId: string, data: Partial<ICampaginModel> }) {
        const { commercialRegister, hajjReference } = await this.isCampaignExist(campaignId);
        const updatedCampaign = await this.campaignDataSource.updateOne({ _id: campaignId }, data)

        //! Delete cloudinary previous images
        if (data?.commercialRegister) {
            if (data.commercialRegister?.file && commercialRegister?.file?.public_id) {
                await cloudinaryService.deleteImage(commercialRegister.file.public_id)
            }
            if (data.commercialRegister?.image && commercialRegister?.image?.public_id) {
                await cloudinaryService.deleteImage(commercialRegister.image.public_id)
            }
        }
        if (data?.hajjReference) {
            if (data.hajjReference?.file && hajjReference?.file?.public_id) {
                await cloudinaryService.deleteImage(hajjReference.file.public_id)
            }
            if (data.hajjReference?.image && hajjReference?.image?.public_id) {
                await cloudinaryService.deleteImage(hajjReference.image.public_id)
            }
        }
        
        return updatedCampaign;
    }
}

export const campaignService = new CampaignService();