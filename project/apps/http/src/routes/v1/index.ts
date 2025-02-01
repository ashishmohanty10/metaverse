import { Request, Response, Router } from "express";
import {
  signInController,
  signUpController,
} from "../../controller/auth-controller";
import { prisma } from "@repo/db/client";

export const router = Router();

router.post("/signup", signUpController);
router.post("/signin", signInController);

router.get("/avatars", async (req: Request, res: Response) => {
  console.log("avatars route");
  try {
    const avatars = await prisma.avatar.findMany({});

    res.status(200).json({
      message: "Avatars fetched",
      data: avatars,
    });
  } catch (error) {
    console.log("error while fetching avatars", error);
  }
});

router.get("/element", async (req: Request, res: Response) => {
  try {
    const element = await prisma.element.findMany({});

    res.status(200).json({
      message: "Elements fetched",
      data: element,
    });
  } catch (error) {
    console.log("error while fetching elements", error);
  }
});
