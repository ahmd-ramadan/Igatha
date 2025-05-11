import { RequestStatusEnum, RequestTypeEnum, UserRolesEnum, UserStatusEnum } from "../enums";
import { ICreateRequestQuery, IRequest, IRequestModel } from "../interfaces";
import { requestRepository } from "../repositories";
import { ApiError, CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND,  pagination } from "../utils";
import { campaignService } from "./campaign.service";
import { cloudinaryService } from "./cloudinary.service";
import { userService } from "./user.service";


class RequestService {
    constructor(private readonly requestDataSource = requestRepository) {}

    async isRequestExist(requestId: string) {
        const isRequestExist = await this.requestDataSource.findById(requestId);
        if (!isRequestExist) {
            throw new ApiError('لا يوجد طلب مطابق لهذا المعرف', NOT_FOUND)
        }
        return isRequestExist;
    }

    async findRequest(query: Partial<IRequestModel>) {
        return await this.requestDataSource.findOne(query)
    }

    async createRequest(request: ICreateRequestQuery) {
        try {
            const requestExist = await this.findRequest({ userId: request.userId, status: RequestStatusEnum.PENDING });
            if (requestExist) {
                if (requestExist.type === RequestTypeEnum.UPDATE) {
                    throw new ApiError( 'لم يتم الموافقة علي طلب التحديث بعد ..  لا يمكن إنشاء طلب حالي لهذا المستخدم ', CONFLICT)
                }
                if (requestExist.type === RequestTypeEnum.NEW) {
                    throw new ApiError( 'لم يتم الموافقة علي طلب الإنشاء بعد ..  لا يمكن إنشاء طلب حالي لهذا المستخدم ', CONFLICT)
                }
            }
            return await this.requestDataSource.createOne(request);
        } catch(error) {
            console.log(error)
            if (error instanceof ApiError) throw error;
            throw new ApiError('حدث خطأ أثناء إنشاء الطلب', INTERNAL_SERVER_ERROR)
        }
    }

    async updateRequest({ requestId, userId, data }: { requestId: string, userId: string, data: any }) {
        try {
            const request = await this.isRequestExist(requestId) as IRequest
            if (request.userId.toString() !== userId.toString()) {
                throw new ApiError('لا يمكن تحديث هذا الطلب', CONFLICT)
            }
            if (request.status === RequestStatusEnum.APPROVED) {
                throw new ApiError('لقد تمت الموافقة علي هذا الطلب بالفعل .. لا يمكن تحديثه', CONFLICT)
            }
            return await this.requestDataSource.updateOne({ _id: requestId }, { requestedData: { ... request.requestedData, ... data }, status: RequestStatusEnum.PENDING })
        } catch(error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('حدث خطأ أثناء تحديث الطلب', INTERNAL_SERVER_ERROR)
        }
    }

    async getAllRequests({ role, userId, status, type, size, page }: { role?: UserRolesEnum, status?: RequestStatusEnum, userId?: string, type?: RequestTypeEnum, size: number, page: number }) {
        try {
            let query: any = {}
            if (role) query.role = role;
            if (status) query.status = status;
            if (userId) query.userId = userId;
            if (type) query.type = type;
            const { skip, limit } = pagination({ page, size })
            return await this.requestDataSource.find(query, { skip, limit })
        } catch(error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('حدث خطأ أثناء جلب الطلبات', INTERNAL_SERVER_ERROR)
        }
    }

    async deleteRequest({ requestId, userId }: { requestId: string, userId: string }) {
        try {
            const request = await this.isRequestExist(requestId) as IRequest;
            if (request.userId.toString() !== userId.toString()) {
                throw new ApiError('لا يمكن تحديث هذا الطلب', CONFLICT)
            }
            const deletedRequest = await this.requestDataSource.deleteOne({ _id: requestId })
            
            const ok = this.delteRequestImages(request.requestedData);

            return deletedRequest;
        } catch(error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('حدث خطأ أثناء حذف الطلب', INTERNAL_SERVER_ERROR)
        }
    }
    
    async approveOnRequest(requestId: string) {
        try {
            const request = await this.isRequestExist(requestId) as IRequest
            if (request.status === RequestStatusEnum.APPROVED) {
                throw new ApiError('لقد تمت الموافقة علي هذا الطلب بالفعل', CONFLICT)
            }

            const updatedUser = await userService.updateOne({ 
                userId: request.userId,
                role: request.role,
                data: { ... request.requestedData, status: UserStatusEnum.APPROVED }, 
            })

            
            // const updatedRequet = await this.requestDataSource.updateOne({ _id: requestId }, { status: RequestStatusEnum.APPROVED }) as IRequest
            const deletedRequest = await this.requestDataSource.deleteOne({ _id: requestId })

            //! Send notification/email to the user with approved request
            
            return updatedUser;
        } catch(error) {
            console.log(error)
            if (error instanceof ApiError) throw error;
            throw new ApiError('حدث خطأ أثناء الموافقة على الطلب', INTERNAL_SERVER_ERROR)
        }
    }

    async rejectOnRequest(requestId: string, rejectionReason: string) {
        try {
            const request = await this.isRequestExist(requestId) as IRequest;
            if (request.status === RequestStatusEnum.APPROVED) {
                throw new ApiError('لقد تمت الموافقة علي هذا الطلب بالفعل .. لا يمكن رفضه', CONFLICT)
            }
            
            await userService.updateOne({ 
                userId: request.userId,
                role: request.role,
                data: { 
                    status: UserStatusEnum.REJECTED, 
                    rejectionReason: request.type === RequestTypeEnum.UPDATE ? "" : rejectionReason }, 
            })

            const updatedRequet = await this.requestDataSource.updateOne({ _id: requestId }, { status: RequestStatusEnum.REJECTED, rejectionReason }) as IRequest
            

            //! Send notification/email to the user with rejected request 
            
            return updatedRequet;
        } catch(error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('حدث خطأ أثناء رفض الطلب', INTERNAL_SERVER_ERROR)
        }
    }

    private async delteRequestImages(requestedData: any) {
        if (requestedData.commercialRegister) {
            if (requestedData.commercialRegister.file) {
                await cloudinaryService.deleteImage(requestedData.commercialRegister.file.public_id)
            }
            if (requestedData.commercialRegister.image) {
                await cloudinaryService.deleteImage(requestedData.commercialRegister.image.public_id)
            }
        }
        if (requestedData.hajjReference) {
            if (requestedData.hajjReference.file) {
                await cloudinaryService.deleteImage(requestedData.hajjReference.file.public_id)
            }
            if (requestedData.hajjReference.image) {
                await cloudinaryService.deleteImage(requestedData.hajjReference.image.public_id)
            }
        }
        if (requestedData.workPermit) {
            if (requestedData.workPermit.file) {
                await cloudinaryService.deleteImage(requestedData.workPermit.file.public_id)
            }
            if (requestedData.workPermit.image) {
                await cloudinaryService.deleteImage(requestedData.workPermit.image.public_id)
            }
        }
    }
}
export const requestService = new RequestService();
