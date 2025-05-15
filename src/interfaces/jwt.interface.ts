import { UserRolesEnum, UserStatusEnum } from "../enums";

export interface IJwtPayload {
    userId?: string;
    role: UserRolesEnum,
    status: UserStatusEnum,
    iat?: number;
    exp?: number;
}