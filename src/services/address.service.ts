import { IAddressModel, ICreateAddressQuery } from "../interfaces";
import { addressRepository } from "../repositories";
import { ApiError, CONFLICT, INTERNAL_SERVER_ERROR } from "../utils";

class AddressService {

    constructor(private readonly addressDataSource = addressRepository) {}

    async findAddressById(addressId: string) {
        const populateObject = ['userData']
        return await this.addressDataSource.findByIdWithPopulate(addressId, populateObject);
    }

    async createNewAddress(data: ICreateAddressQuery)  {
        try {
            return await this.addressDataSource.createOne(data);
        } catch(err) {
            throw new ApiError('فشلت عملية إضافة عنوان جديد', INTERNAL_SERVER_ERROR)
        }
    }

    async isAddressExist(addressId: string) {
        const addressExist = await this.findAddressById(addressId);
        if (!addressExist) {
            throw new ApiError(`العنوان غير موجود`, CONFLICT)
        } 
        return addressExist;
    } 

    async updateAddressById({ addressId, data, userId }: { addressId: string, data: Partial<IAddressModel>, userId: string }) {
        const address = await this.isAddressExist(addressId);
        if (address.userId.toString() !== userId.toString()) {
            throw new ApiError(`لا يمكن تحديث هذا العنوان`, CONFLICT)
        }
        return await this.addressDataSource.updateOne({ _id: addressId  }, data);
    }
    
    async findManyAddressByUserId(userId: string) {
        return await this.addressDataSource.find({ userId });
    }
}

export const addressService = new AddressService();