import { cloudinarySurplusesFolder } from "../config";
import { UserStatusEnum } from "../enums";
import { ICreateSurplusQuery, ISurplusModel, IUpdateSurplusQuery } from "../interfaces";
import {surplusRepository } from "../repositories";
import { ApiError, BAD_REQUEST, FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, pagination } from "../utils";
import { cloudinaryService } from "./cloudinary.service";
import { FilterQuery, UpdateQuery } from "mongoose";


class SurplusService {

    private readonly populatedArray = ['userData']
    constructor(
        private readonly surplusDataSource = surplusRepository
    ) {}

    async isSurplusExist(surplusId: string) {
        const surplus = await this.surplusDataSource.findOneWithPopulate({ _id: surplusId }, this.populatedArray);
        if (!surplus) {
            throw new ApiError('الفائض غير موجود', NOT_FOUND);
        }
        return surplus;
    }  

    async createSurplus({ userStatus, userId, data, files }: { userStatus: UserStatusEnum, userId: string; data: ICreateSurplusQuery, files: any }) {
        try{
            const { title, description } = data;
            
            // Is user Approved
            let isActive = false;
            if (userStatus === UserStatusEnum.APPROVED) {
                isActive = true;
            }

            //! Handle Images
            if (!files || !files?.images || files?.images?.length <= 0) {
                throw new ApiError('يجب رفع صورة واحدة علي الاقل لهذا المنتج', BAD_REQUEST);
            }

            const images = [];
            for(const file of files.images) {
                const image = await cloudinaryService.uploadImage({
                    fileToUpload: file.path,
                    folderPath: cloudinarySurplusesFolder
                });
                images.push(image);
            }

            const surplus = await this.surplusDataSource.createOne({
                title,
                description,
                images,
                isActive,
                userId
            }, this.populatedArray)

            return surplus;
        } catch(error) {
            console.log(error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء إضافة الفائض', INTERNAL_SERVER_ERROR);
        }
    }

    async updateSurplus({ surplusId, userId,  data, files }: { surplusId: string, userId: string, data: IUpdateSurplusQuery, files: any }) {
        try{
            const { title, description, deletedImagesIds, updatedImagesIds } = data;
            const surplus = await this.isSurplusExist(surplusId);
            if (!surplus) {
                throw new ApiError('الوجبة غير موجود', NOT_FOUND);
            }
            if (surplus.userId.toString() !== userId.toString()) {
                throw new ApiError('لا يمكن تحديث هذا الفائض', FORBIDDEN);
            }

            const updatedData: Partial<ISurplusModel> = {};
            if (title) updatedData.title = title;
            if (description) updatedData.description = description;
           

            //! Images
            let newImages = surplus.images;
            if (files) {
                if (deletedImagesIds && deletedImagesIds?.length > 0) {
                    if(deletedImagesIds?.length > newImages?.length) {
                        throw new ApiError('يجب أن يكون عدد الصور المحذوفة أقل من أو يساوي لعدد الصور الفعلية', BAD_REQUEST);
                    }
                    for(const public_id of deletedImagesIds) {
                        await cloudinaryService.deleteImage(public_id);
                        newImages = newImages.filter(img => img.public_id !== public_id)
                    }
                }
                if (files?.updatedImages && files?.updatedImages?.length > 0) {
                    if(!updatedImagesIds || updatedImagesIds?.length != files?.updatedImages?.length) {
                        throw new ApiError('يجب أن يكون عدد الصور المحدثة مساويا لعدد الصور المحدثة', BAD_REQUEST);
                    }
                    if(!updatedImagesIds || updatedImagesIds?.length > newImages?.length) {
                        throw new ApiError('يجب أن يكون عدد الصور المحدثة أقل من أو يساوي لعدد الصور الفعلية', BAD_REQUEST);
                    }
                    for(let i = 0; i < updatedImagesIds?.length; i++) {
                        const updatedImage = await cloudinaryService.updateImage({
                            oldPublicId: updatedImagesIds[i],
                            fileToUpload: files?.updatedImages[i].path,
                            folderPath: cloudinarySurplusesFolder,
                        })
                        console.log("updatedImage", updatedImage);
                        console.log("newImages", newImages);
                        newImages = newImages.map(img => img.public_id === updatedImagesIds[i] ? updatedImage : img)
                        console.log("newImages", newImages);
                    }
                }
                if (files?.newImages && files?.newImages?.length > 0) {
                    for(const file of files.newImages) {
                        const image = await cloudinaryService.uploadImage({
                            fileToUpload: file.path, 
                            folderPath: cloudinarySurplusesFolder, 
                        });
                        newImages.push(image);
                    }
                }
            } 
            updatedData.images = newImages;

            const updatedSurplus = await this.surplusDataSource.updateOne({ _id: surplus._id, userId }, updatedData, this.populatedArray);

            return updatedSurplus;            
        } catch(error) {
            console.log(error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء تحديث الفائض', INTERNAL_SERVER_ERROR);
        }
    }

    async deleteSurplus({ surplusId, userId }: { surplusId: string, userId: string }) {
        try{
            const surplus = await this.isSurplusExist(surplusId);
            if (!surplus) {
                throw new ApiError('الوجبة غير موجودة', NOT_FOUND);
            }
            if (surplus.userId.toString() !== userId.toString()) {
                throw new ApiError('لا يمكن حذف هذه الوجبة', FORBIDDEN);
            }

            const deletedSurplus = await this.surplusDataSource.deleteOne({ _id: surplusId, userId });

            return deletedSurplus;            
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء حذف الفائض', INTERNAL_SERVER_ERROR);
        }
    }

    async getAllSurpluss({ page, size, userId }: { page: number, size: number, userId?: string }) {
        try{
            const query: any = {};
            if (userId) query.userId = userId;

            const { skip, limit} = pagination({ page, size });

            const surpluses = await this.surplusDataSource.findWithPopulate(query, this.populatedArray, { skip, limit });

            return surpluses;

        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء جلب كل الفائض', INTERNAL_SERVER_ERROR);
        }
    }

    async updateOne({ query, data }: { query: FilterQuery<ISurplusModel>, data: Partial<ISurplusModel>}) {
        const updatedSurplus = await this.surplusDataSource.updateOne(query, data, this.populatedArray);
        return updatedSurplus;
    }

    async adminAddNoteToSurplus({ surplusId, note }: { surplusId: string, note: string }) {
        try {
            const isSurplusExist = await this.isSurplusExist(surplusId);
            if (!isSurplusExist) {
                throw new ApiError('الفائض غير موجودة', NOT_FOUND);
            }
            const updatedSurplus = await this.surplusDataSource.updateOne({ _id: isSurplusExist._id }, { adminNotes: note }, this.populatedArray);
            
            //! Send notification for user

            return updatedSurplus;
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء إضافة الملاحظة', INTERNAL_SERVER_ERROR);
        }
    }

    async updateMany({ query, data }: { query: FilterQuery<ISurplusModel>, data: UpdateQuery<ISurplusModel> }) {
        return await this.surplusDataSource.updateMany(query, data) 
    }

}

export const surplusService = new SurplusService();