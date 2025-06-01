import { UserRolesEnum } from "../enums";

export const manageProductOrder: UserRolesEnum[] = [
    UserRolesEnum.KITCHEN
]

export const accessToProductOrder: UserRolesEnum[] = [
    UserRolesEnum.SUPPLIER
]
export const toProductOrder: UserRolesEnum[] = [
    UserRolesEnum.KITCHEN,
    UserRolesEnum.SUPPLIER,
    UserRolesEnum.ADMIN
]