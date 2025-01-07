import { NextFunction, Request, Response, Router } from "express";
import {
  signInController,
  signUpController,
} from "../../controller/auth-controller";

export const router = Router();

router.post("/signup", signUpController);
router.post("/signin", signInController);

router.get("/avatars", (req: Request, res: Response, next: NextFunction) => {});
router.get("/element", (req: Request, res: Response, next: NextFunction) => {});
