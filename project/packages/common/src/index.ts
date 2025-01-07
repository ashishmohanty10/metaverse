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

export type signUpSchemaTypes = z.infer<typeof signUpSchema>;
export type signInSchemaTypes = z.infer<typeof signInSchema>;
