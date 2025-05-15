import { Request } from 'express';
import { UserRolesEnum, UserStatusEnum } from '../enums';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRolesEnum;
    status: UserStatusEnum
  };
}
