import { randomInt } from "crypto";
import { cloudinaryMealsFolder } from "../config";
import { UserStatusEnum } from "../enums";
import { ICreateMealQuery, IMealModel, IUpdateMealQuery } from "../interfaces";
import { mealRepository } from "../repositories";
import { ApiError, BAD_REQUEST, FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, pagination } from "../utils";
import { cloudinaryService } from "./cloudinary.service";
import { slugService } from "./slugify.service";
import { FilterQuery, UpdateQuery } from "mongoose";


class MealService {

    private readonly populatedArray = ['kitchenData']
    constructor(
        private readonly mealDataSource = mealRepository
    ) {}

    async isMealExist(mealId: string) {
        const meal = await this.mealDataSource.findOneWithPopulate({ _id: mealId }, this.populatedArray);
        if (!meal) {
            throw new ApiError('الوجبة غير موجود', NOT_FOUND);
        }
        return meal;
    }

    async findMealBySlug(slug: string) {
        try {
            const decodedSlug = decodeURIComponent(slug);
            const meal = await this.mealDataSource.findOneWithPopulate({ slug: decodedSlug }, this.populatedArray);
            return meal;
        } catch (error) {
            throw new ApiError('Error finding meal by slug:', INTERNAL_SERVER_ERROR);
        }
    }

    async createMeal({ kitchenStatus, kitchenId, data, files }: { kitchenStatus: UserStatusEnum, kitchenId: string; data: ICreateMealQuery, files: any }) {
        try{
            const { title, desc, price, discount, stock, minimumOrderQuantity } = data;
            // Slugify and replace # with -
            const slug = (await slugService.generateSlug(title, 'meal')).replace(/#/g, '8');

            console.log(kitchenStatus)
            
            // Is kitcehn Approved
            let isActive = false;
            if (kitchenStatus === UserStatusEnum.APPROVED) {
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
                    folderPath: cloudinaryMealsFolder
                });
                images.push(image);
            }

            const appliedPrice = price - (price * (discount || 0));

            const meal = await this.mealDataSource.createOne({
                title,
                slug,
                desc,
                price,
                discount: discount || 0,
                images,
                stock,
                isActive,
                kitchenId,
                appliedPrice,
                minimumOrderQuantity,
            }, this.populatedArray)

            return meal;
        } catch(error) {
            console.log(error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء إضافة الوجبة', INTERNAL_SERVER_ERROR);
        }
    }

    async updateMeal({ mealSlug, kitchenId,  data, files }: { mealSlug: string, kitchenId: string, data: IUpdateMealQuery, files: any }) {
        try{
            const { title, desc, price, discount, stock, minimumOrderQuantity, updatedImagesIds, deletedImagesIds } = data;
            const meal = await this.findMealBySlug(mealSlug);
            if (!meal) {
                throw new ApiError('الوجبة غير موجود', NOT_FOUND);
            }
            if (meal.kitchenId.toString() !== kitchenId.toString()) {
                throw new ApiError('لا يمكن تحديث هذه الوجبة', FORBIDDEN);
            }

            const updatedData: Partial<IMealModel> = {};
            if (title) {
                updatedData.title = title;
                updatedData.slug = (await slugService.generateSlug(title, 'meal')).replace(/#/g, '-');
            }
            if (desc) updatedData.desc = desc;

            let newPrice = meal.price, newDiscount = meal.discount; 
            if (price !== undefined) updatedData.price = newPrice = price;
            if (discount !== undefined) updatedData.discount = newDiscount = discount;
            updatedData.appliedPrice = (newPrice) - (newDiscount* (newPrice) / 100)
            if (stock !== undefined) updatedData.stock = stock;
            if (minimumOrderQuantity !== undefined) updatedData.minimumOrderQuantity = minimumOrderQuantity;

            //! Images
            let newImages = meal.images;
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
                            folderPath: cloudinaryMealsFolder,
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
                            folderPath: cloudinaryMealsFolder, 
                        });
                        newImages.push(image);
                    }
                }
            } 
            updatedData.images = newImages;

            const updatedMeal = await this.mealDataSource.updateOne({ _id: meal._id, slug: mealSlug, kitchenId }, updatedData, this.populatedArray);

            return updatedMeal;            
        } catch(error) {
            console.log(error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء تحديث الوجبة', INTERNAL_SERVER_ERROR);
        }
    }

    async deleteMeal({ mealSlug, kitchenId }: { mealSlug: string, kitchenId: string }) {
        try{
            const meal = await this.findMealBySlug(mealSlug);
            if (!meal) {
                throw new ApiError('الوجبة غير موجودة', NOT_FOUND);
            }
            if (meal.kitchenId.toString() !== kitchenId.toString()) {
                throw new ApiError('لا يمكن حذف هذه الوجبة', FORBIDDEN);
            }
            if(meal.isDeleted) {
                throw new ApiError('الوجبة محذوفة بالفعل', BAD_REQUEST);
            }

            const deletedMeal = await this.mealDataSource.updateOne({ _id: meal._id, slug: mealSlug }, { isDeleted: true, isActive: false }, this.populatedArray);

            return deletedMeal;            
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء حذف الوجبة', INTERNAL_SERVER_ERROR);
        }
    }

    async getAllMeals({ page, size, search, fromPrice, toPrice, kitchenId }: { page: number, size: number, search?: string, fromPrice?: number, toPrice?: number, kitchenId?: string }) {
        try{
            const query: any = {};
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { desc: { $regex: search, $options: 'i' } },
                ];
            }
            if (fromPrice) query.price = { $gte: fromPrice };
            if (toPrice) query.price = { $lte: toPrice };
            if (kitchenId) query.kitchenId = kitchenId;

            const { skip, limit} = pagination({ page, size });

            const meals = await this.mealDataSource.findWithPopulate(query, this.populatedArray, { skip, limit });

            return meals;

        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء جلب الوجبات', INTERNAL_SERVER_ERROR);
        }
    }

    async updateOne({ query, data }: { query: FilterQuery<IMealModel>, data: Partial<IMealModel>}) {
        const updatedMeal = await this.mealDataSource.updateOne(query, data, this.populatedArray);
        return updatedMeal;
    }

    async adminAddNoteToMeal({ mealSlug, note }: { mealSlug: string, note: string }) {
        try {
            const isMealExist = await this.findMealBySlug(mealSlug);
            if (!isMealExist) {
                throw new ApiError('الوجبة غير موجودة', NOT_FOUND);
            }
            const updatedMeal = await this.mealDataSource.updateOne({ slug: mealSlug, _id: isMealExist._id }, { adminNotes: note }, this.populatedArray);
            
            //! Send notification for kitchen
            return updatedMeal;
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء إضافة الملاحظة', INTERNAL_SERVER_ERROR);
        }
    }

    async updateMany({ query, data }: { query: FilterQuery<IMealModel>, data: UpdateQuery<IMealModel> }) {
        return await this.mealDataSource.updateMany(query, data) 
    }

}

export const mealService = new MealService();