import { NextFunction, Request, Response } from "express";
import { signUpSchema, signInSchema } from "@repo/common";
import createHttpError from "http-errors";

export async function signup(req: Request, res: Response, next: NextFunction) {
  const { email, name, password } = req.body;

  const parsedData = signUpSchema.safeParse({ name, email, password });

  if (!parsedData.success) {
    return next(
      createHttpError(400, "Validation failed", {
        details: parsedData.error.errors,
      })
    );
  }

  try {
  } catch (error) {}
}
