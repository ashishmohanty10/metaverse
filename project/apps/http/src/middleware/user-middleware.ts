import { NextFunction, Response } from "express";
import { AuthRequest } from "./admin-middleware";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export function userMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.accessToken;

  if (!token) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, config.jwtSecret as string) as {
      id: string;
      role: string;
    };

    if (decodedToken.role !== "USER") {
      res.status(401).json({
        message: "Unauthorized: Invalid role",
      });
      return;
    }

    req.user = { id: decodedToken.id, role: decodedToken.role };

    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }
}
