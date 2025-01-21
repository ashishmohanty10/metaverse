import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
  user?: {
    id?: string;
    role?: string;
  };
}

export function adminMiddleware(
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
    const decoded = jwt.verify(token, config.jwtSecret as string) as {
      id: string;
      role: string;
    };

    if (decoded.role !== "admin" || decoded.id !== req.user?.id) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }
    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }
}
