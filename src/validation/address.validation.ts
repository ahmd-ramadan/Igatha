import { z } from 'zod';

export const createAddressSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    phone_number: z.string(),
    apartment: z.string(),
    floor: z.string(),
    building: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
});

export const updateAddressSchema = z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone_number: z.string().optional(),
    apartment: z.string().optional(),
    floor: z.string().optional(),
    building: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
})