import { NextFunction, Response, Router } from "express";
import { updateMetaDataSchema } from "@repo/common";
import { AuthRequest } from "../../middleware/admin-middleware";
import { prisma } from "@repo/db/client";
import { userMiddleware } from "../../middleware/user-middleware";

export const userRoute = Router();

userRoute.post(
  "/metadata",
  userMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const data = req.body;
    const parsedData = updateMetaDataSchema.safeParse(data);

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    try {
      const avatar = await prisma.avatar.findUnique({
        where: {
          id: parsedData.data.avatarId,
        },
      });

      if (!avatar) {
        res.status(400).json({
          success: false,
          message: "Invalid avatar ID",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: {
          id: req.user?.id,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      await prisma.user.update({
        where: {
          id: req.user?.id,
        },
        data: {
          avatarId: parsedData.data.avatarId,
        },
      });

      res.status(200).json({
        success: true,
        message: "Metadata updated successfully",
      });
    } catch (error) {
      console.error("Error in updateUserMetadata:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

userRoute.get(
  "/metadata/bulk",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userIdString = (req.query.ids ?? "[]") as string;
      let avatarIds: string[];

      try {
        avatarIds = JSON.parse(userIdString);
        if (!Array.isArray(avatarIds)) {
          throw new Error("Invalid ids format");
        }
      } catch (error) {
        res.status(400).json({
          success: false,
          message: "Invalid ids format. Expected JSON array of strings",
        });
        return;
      }

      const metadata = await prisma.avatar.findMany({
        where: {
          id: {
            in: avatarIds,
          },
        },
        select: {
          imageUrl: true,
          id: true,
          users: {
            select: {
              id: true,
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        avatars: metadata.map((x) => ({
          avatarId: x.id,
          userId: x.users[0]?.id,
        })),
      });
    } catch (error) {
      console.error("Error in metadata/bulk:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);
