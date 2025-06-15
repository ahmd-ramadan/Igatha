import { UserRolesEnum } from "../enums";

export const manageMealOrder: UserRolesEnum[] = [
    UserRolesEnum.CAMPAIGN
]

export const accessToMealOrder: UserRolesEnum[] = [
    UserRolesEnum.KITCHEN
]
export const toMealOrder: UserRolesEnum[] = [
    UserRolesEnum.KITCHEN,
    UserRolesEnum.CAMPAIGN,
    UserRolesEnum.ADMIN
]