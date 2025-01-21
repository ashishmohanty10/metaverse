import { NextFunction, Response } from "express";
import { AuthRequest } from "./admin-middleware";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export function userMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const decodeToken = jwt.verify(token, config.jwtSecret as string) as {
      id: string;
      role: string;
    };

    if (decodeToken?.role !== "user" || decodeToken.id !== req.user?.id) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }
    next();
  } catch (error) {
    console.log("error in user middleware", error);
  }
}
