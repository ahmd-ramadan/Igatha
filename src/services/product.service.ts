import strict from "assert/strict";
import { cloudinaryProductsFolder } from "../config";
import { UserStatusEnum } from "../enums";
import { ICreateProductQuery, IProductModel, IUpdateProductQuery } from "../interfaces";
import { productRepository } from "../repositories";
import { ApiError, BAD_REQUEST, FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, pagination } from "../utils";
import { cloudinaryService } from "./cloudinary.service";
import { slugService } from "./slugify.service";
import { FilterQuery, UpdateQuery } from "mongoose";


class ProductService {

    private readonly populatedArray = ['supplierData']
    constructor(
        private readonly productDataSource = productRepository
    ) {}

    async isProductExist(productId: string) {
        const product = await this.productDataSource.findOneWithPopulate({ _id: productId }, this.populatedArray);
        if (!product) {
            throw new ApiError('المنتج غير موجود', NOT_FOUND);
        }
        return product;
    }

    async findProductBySlug(slug: string) {
        const product = await this.productDataSource.findOneWithPopulate({ slug }, this.populatedArray);
        return product;
    }

    async createProduct({ supplierStatus, supplierId, data, files }: { supplierStatus: UserStatusEnum, supplierId: string; data: ICreateProductQuery, files: any }) {
        try{
            const { title, desc, price, discount, stock, minimumOrderQuantity } = data;
            // Slugify
            const slug = await slugService.generateSlug(title, 'product');

            console.log(supplierStatus)
            
            // Is suppler Approved
            let isActive = false;
            if (supplierStatus === UserStatusEnum.APPROVED) {
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
                    folderPath: cloudinaryProductsFolder
                });
                images.push(image);
            }

            const appliedPrice = price - (price * (discount || 0));

            const product = await this.productDataSource.createOne({
                title,
                slug,
                desc,
                price,
                discount: discount || 0,
                images,
                stock,
                isActive,
                supplierId,
                appliedPrice,
                minimumOrderQuantity,
            }, this.populatedArray)

            return product;
        } catch(error) {
            console.log(error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء إضافة المنتج', INTERNAL_SERVER_ERROR);
        }
    }

    async updateProduct({ productSlug, supplierId,  data, files }: { productSlug: string, supplierId: string, data: IUpdateProductQuery, files: any }) {
        try{
            const { title, desc, price, discount, stock, minimumOrderQuantity, updatedImagesIds, deletedImagesIds } = data;
            const product = await this.findProductBySlug(productSlug);
            if (!product) {
                throw new ApiError('المنتج غير موجود', NOT_FOUND);
            }
            if (product.supplierId.toString() !== supplierId.toString()) {
                throw new ApiError('لا يمكن تحديث هذا المنتج', FORBIDDEN);
            }

            const updatedData: Partial<IProductModel> = {};
            if (title) {
                updatedData.title = title;
                updatedData.slug = await slugService.generateSlug(title, 'product');
            }
            if (desc) updatedData.desc = desc;
            if (price) updatedData.price = price;
            if (discount) updatedData.discount = discount;
            if (stock) updatedData.stock = stock;
            if (minimumOrderQuantity) updatedData.minimumOrderQuantity = minimumOrderQuantity;

            //! Images
            let newImages = product.images;
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
                            folderPath: cloudinaryProductsFolder,
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
                            folderPath: cloudinaryProductsFolder, 
                        });
                        newImages.push(image);
                    }
                }
            } 
            updatedData.images = newImages;

            const updatedProduct = await this.productDataSource.updateOne({ _id: product._id, slug: productSlug, supplierId }, updatedData, this.populatedArray);

            return updatedProduct;            
        } catch(error) {
            console.log(error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء تحديث المنتج', INTERNAL_SERVER_ERROR);
        }
    }

    async deleteProduct({ productSlug, supplierId }: { productSlug: string, supplierId: string }) {
        try{
            const product = await this.findProductBySlug(productSlug);
            if (!product) {
                throw new ApiError('المنتج غير موجود', NOT_FOUND);
            }
            if (product.supplierId.toString() !== supplierId.toString()) {
                throw new ApiError('لا يمكن حذف هذا المنتج', FORBIDDEN);
            }
            if(product.isDeleted) {
                throw new ApiError('المنتج محذوف بالفعل', BAD_REQUEST);
            }

            const deletedProduct = await this.productDataSource.updateOne({ _id: product._id, slug: productSlug }, { isDeleted: true, isActive: false }, this.populatedArray);

            return deletedProduct;            
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء حذف المنتج', INTERNAL_SERVER_ERROR);
        }
    }

    async getAllProducts({ page, size, search, fromPrice, toPrice, supplierId }: { page: number, size: number, search?: string, fromPrice?: number, toPrice?: number, supplierId?: string }) {
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
            if (supplierId) query.supplierId = supplierId;

            const { skip, limit} = pagination({ page, size });

            const products = await this.productDataSource.findWithPopulate(query, this.populatedArray, { skip, limit });

            return products;

        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء جلب المنتجات', INTERNAL_SERVER_ERROR);
        }
    }

    async updateOne({ query, data }: { query: FilterQuery<IProductModel>, data: Partial<IProductModel>}) {
        const updatedProduct = await this.productDataSource.updateOne(query, data, this.populatedArray);
        return updatedProduct;
    }

    async adminAddNoteToProduct({ productSlug, note }: { productSlug: string, note: string }) {
        try {
            const isProductExist = await this.findProductBySlug(productSlug);
            if (!isProductExist) {
                throw new ApiError('المنتج غير موجود', NOT_FOUND);
            }
            const updatedProduct = await this.productDataSource.updateOne({ slug: productSlug, _id: isProductExist._id }, { adminNotes: note }, this.populatedArray);
            
            //! Send notification for supplier
            return updatedProduct;
        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء إضافة الملاحظة', INTERNAL_SERVER_ERROR);
        }
    }

    async updateMany({ query, data }: { query: FilterQuery<IProductModel>, data: UpdateQuery<IProductModel> }) {
        return await this.productDataSource.updateMany(query, data) 
    }

}

export const productService = new ProductService();