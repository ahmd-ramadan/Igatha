import { z } from "zod";
import { registerSchema } from "./auth.validation";
import { UserRolesEnum } from "../enums";
import { imageSchema } from "./file.validation";

export const charityRegisterSchema = registerSchema.extend({
    role: z.nativeEnum(UserRolesEnum).default(UserRolesEnum.CHARITY),
})