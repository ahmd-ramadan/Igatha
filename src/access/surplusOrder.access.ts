import { UserRolesEnum } from "../enums";

export const manageSurplusOrder: UserRolesEnum[] = [
    UserRolesEnum.CHARITY
]

export const accessToSurplusOrder: UserRolesEnum[] = [
    UserRolesEnum.SUPPLIER,
    UserRolesEnum.KITCHEN,
    UserRolesEnum.CAMPAIGN,
]
export const toSurplusOrder: UserRolesEnum[] = [
    UserRolesEnum.SUPPLIER,
    UserRolesEnum.KITCHEN,
    UserRolesEnum.CAMPAIGN,
    UserRolesEnum.CHARITY,
    UserRolesEnum.ADMIN
]