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
    console.log("req.cookies", req.cookies);
    const token = req.cookies.accessToken;
    console.log("token", token);

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret as string) as {
      id: string;
      role: string;
    };
    

    if (decoded.role !== "ADMIN") {
      res.status(401).json({ message: "Unauthorized: Admin role required" });
      return;
    }

    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}
