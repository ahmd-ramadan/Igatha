import { z } from "zod";
import { registerSchema } from "./auth.validation";
import { UserRolesEnum } from "../enums";
import { imageSchema } from "./file.validation";

export const guestRegisterSchema = registerSchema.extend({
    role: z.nativeEnum(UserRolesEnum).default(UserRolesEnum.KITCHEN),
    businessLicense: z.object({
        file: imageSchema,
        number: z.string()
    }),
})