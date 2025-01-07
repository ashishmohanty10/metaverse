import { NextFunction, Request, Response, Router } from "express";

export const userRoute = Router();

userRoute.post(
  "/metadata",
  (req: Request, res: Response, next: NextFunction) => {}
);
userRoute.get(
  "metadata/bulk",
  (req: Request, res: Response, next: NextFunction) => {}
);
