import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(4, { message: "Must be of 4 or more characters" }),
  email: z
    .string()
    .email()
    .min(5, { message: "Must be of 5 or more characters" }),
  password: z
    .string()
    .min(8, { message: "Must be of 8 or more characters" })
    .max(32, { message: "Must be less than 32 character" }),
});

export const signInSchema = z.object({
  email: z
    .string()
    .email()
    .min(5, { message: "Must be of 5 or more characters" }),
  password: z
    .string()
    .min(8, { message: "Must be of 8 or more characters" })
    .max(32, { message: "Must be less than 32 character" }),
});

export const updateMetaDataSchema = z.object({
  avatarId: z.string().min(1),
});

export const createSpaceSchema = z.object({
  name: z.string().min(1),
  dimension: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
  mapId: z.string().optional(),
});

export const deleteElementSchema = z.object({
  id: z.string(),
});

export const addElementSchema = z.object({
  elementId: z.string(),
  spaceId: z.string(),
  x: z.number(),
  y: z.number(),
});

export const createElementSchema = z.object({
  imageUrl: z.string(),
  width: z.number(),
  height: z.number(),
  static: z.number(),
});

export const updateAnElement = z.object({
  imageUrl: z.string(),
});

export const createAnAvatarSchema = z.object({
  imageUrl: z.string(),
  name: z.string(),
});

export const createMapSchema = z.object({
  thumbnail: z.string(),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
  name: z.string(),
  defaultElements: z.array(
    z.object({
      elementId: z.string(),
      x: z.number(),
      y: z.number(),
    })
  ),
});

declare global {
  namespace Express {
    export interface Request {
      role?: "Admin" | "User";
      userId?: string;
    }
  }
}

export type signUpSchemaTypes = z.infer<typeof signUpSchema>;
export type signInSchemaTypes = z.infer<typeof signInSchema>;
export type updateMetaDataSchemaTypes = z.infer<typeof updateMetaDataSchema>;
export type createSpaceSchemaTypes = z.infer<typeof createSpaceSchema>;
export type deleteElementSchemaTypes = z.infer<typeof deleteElementSchema>;
export type addElementSchemaTypes = z.infer<typeof addElementSchema>;
export type createElementSchemaTypes = z.infer<typeof createElementSchema>;
export type updateAnElementTypes = z.infer<typeof updateAnElement>;
export type createAnAvatarSchemaTypes = z.infer<typeof createAnAvatarSchema>;
export type createMapSchemaTypes = z.infer<typeof createMapSchema>;
