import { cloudinaryAvatarsFolder } from "../config";
import { UserRolesEnum } from "../enums";
import { ICreateUserQuery, IUserModel } from "../interfaces";
import { userRepository } from "../repositories";
import { ApiError, CONFLICT, NOT_FOUND, pagination } from "../utils";
import { campaignService } from "./campaign.service";
import { cloudinaryService } from "./cloudinary.service";
import { HashingService } from "./hashing.service";
import { kitchenService } from "./kitchen.service";

class UserService {

    constructor(private readonly userDataSource = userRepository) {}

    async isUserExist(userId: string) {
        const isUserExist = await this.userDataSource.findById(userId);
        if (!isUserExist) {
            throw new ApiError('هذا المستخدم غير موجود', NOT_FOUND)
        }
        return isUserExist;
    }

    async isUserExistByEmail({ email, role }: { email: string, role: UserRolesEnum }) {
        const isUserExist = await this.userDataSource.findOne({ email, role});
        return isUserExist ? true : false;
    }

    async findUserByEmail(email: string) {
        return await this.userDataSource.findOne({ email });
    }

    async createNewUser(data: ICreateUserQuery) {
        return await this.userDataSource.createOne(data)
    }

    async updateOne({ userId, role, data }: { userId: string, role: UserRolesEnum, data: any}) {
        if (role === UserRolesEnum.CAMPAIGN) {
            return await campaignService.updateOne({ campaignId: userId, data })
        } 
        // if (role === UserRolesEnum.CHARITY) {
        //     return await charityService.updateOne({ charityId: userId, data })
        // } 
        if (role === UserRolesEnum.KITCHEN) {
            return await kitchenService.updateOne({ kitchenId: userId, data })
        } 
        // if (role === UserRolesEnum.SUPPLIER) {
        //     return await supplierService.updateOne({ supplierId: userId, data })
        // } if (role === UserRolesEnum.GUEST) { 
        //     return await guestService.updateOne({ guestId: userId, data })
        // } if (role === UserRolesEnum.ADMIN) {
        //     return await adminService.updateOne({ adminId: userId, data })
        // }
        return await this.userDataSource.updateOne({ _id: userId }, data)
    }

    async updateProfile({ userId, data, files }: { userId: string, data: Partial<IUserModel> & { specialization?: string }, files: any }) {
        const { name, phone } = data;
        const { avatar, role } = await this.isUserExist(userId);

        const updatedData: Partial<IUserModel> = {}
        if (name) updatedData.name = name;
        if (phone) updatedData.phone = phone;


        if (files && files.length) {
            const { secure_url, public_id } = await cloudinaryService.uploadImage({ 
                fileToUpload: files[0].path,
                folderPath: cloudinaryAvatarsFolder 
            });
            if (avatar?.secure_url && avatar?.public_id) {
                await cloudinaryService.deleteImage(avatar?.public_id);
            }
            updatedData.avatar = {
                secure_url,
                public_id
            }
        }

        return await this.updateOne({ userId, role, data: updatedData })
    }

    async updatePassword({ userId, oldPassword, newPassword }: { userId: string, oldPassword: string, newPassword: string }) {
        const { password, role } = await this.isUserExist(userId);

        const isMatched = await HashingService.compare(oldPassword, password as string);
        if (!isMatched) {
            throw new ApiError('كلمة المرور القديمة غير صحيحة', CONFLICT)
        }

        const hashedPassword = await HashingService.hash(newPassword);

        return await this.updateOne({ userId, role, data: { password: hashedPassword } })
    } 
    
    async findUserById(userId: string) {
        return await this.userDataSource.findById(userId)
    }

    async findAllUsers({ page, size, role }: { page: number, size: number, role?: string }) {
        const { limit, skip } = pagination({ page, size });
        let query: any = {}
        if (role) query.role = role;
        return this.userDataSource.find(query, { skip, limit })
    }
}

export const userService = new UserService();