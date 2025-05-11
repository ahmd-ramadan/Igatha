import { UserRolesEnum } from "../enums";

export const getRequest: UserRolesEnum[] = [
    UserRolesEnum.ADMIN,
    UserRolesEnum.SUPPLIER,
    UserRolesEnum.KITCHEN,
    UserRolesEnum.CHARITY,
    UserRolesEnum.CAMPAIGN
]
export const manageRequest: UserRolesEnum[] = [
    UserRolesEnum.SUPPLIER,
    UserRolesEnum.KITCHEN,
    UserRolesEnum.CHARITY,
    UserRolesEnum.CAMPAIGN
] 

export const accessOnRequest: UserRolesEnum[] = [
    UserRolesEnum.ADMIN
]  