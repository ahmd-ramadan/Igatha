import { cloudinaryProductsFolder } from "../config";
import { UserStatusEnum } from "../enums";
import { ICreateProductQuery, IProductModel } from "../interfaces";
import { productRepository } from "../repositories";
import { ApiError, BAD_REQUEST, FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, pagination } from "../utils";
import { cloudinaryService } from "./cloudinary.service";
import { slugService } from "./slugify.service";


class ProductService {

    constructor(
        private readonly productDataSource = productRepository
    ) {}

    async isProductExist(productId: string) {
        const product = await this.productDataSource.findOne({ _id: productId });
        if (!product) {
            throw new ApiError('المنتج غير موجود', NOT_FOUND);
        }
        return product;
    }

    async findProductBySlug(slug: string) {
        const product = await this.productDataSource.findOne({ slug });
        return product;
    }

    async createProduct({ supplierStatus, supplierId, data, files }: { supplierStatus: UserStatusEnum, supplierId: string; data: ICreateProductQuery, files: any }) {
        try{
            const { title, desc, price, discount, stock, minimumQuantity } = data;
            // Slugify
            const slug = await slugService.generateSlug(title, 'product');

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
                minimumQuantity,
            })

            return product;
        } catch(error) {
            console.log(error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء إضافة المنتج', INTERNAL_SERVER_ERROR);
        }
    }

    async updateProduct({ productSlug, supplierId,  data, files }: { productSlug: string, supplierId: string, data: Partial<ICreateProductQuery>, files: any }) {
        try{
            const { title, desc, price, discount, stock, minimumQuantity } = data;
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
            if (minimumQuantity) updatedData.minimumQuantity = minimumQuantity;

            //! Images 
            const updatedProduct = await this.productDataSource.updateOne({ _id: product._id, slug: productSlug, supplierId }, updatedData);

            return updatedProduct;            
        } catch(error) {
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
            
            //! Images 

            const deletedProduct = await this.productDataSource.updateOne({ _id: product._id, slug: productSlug }, { isDeleted: true, isActive: false });

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

            if (search) query.title = { $regex: search, $options: 'i' };
            if (fromPrice) query.price = { $gte: fromPrice };
            if (toPrice) query.price = { $lte: toPrice };
            if (supplierId) query.supplierId = supplierId;

            const { skip, limit} = pagination({ page, size });

            const products = await this.productDataSource.find({ query, skip, limit });

            return products;

        } catch(error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('حدث خطأ أثناء جلب المنتجات', INTERNAL_SERVER_ERROR);
        }
    }
}

export const productService = new ProductService();