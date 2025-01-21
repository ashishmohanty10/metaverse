import { NextFunction, Request, Response, Router } from "express";
import { AuthRequest } from "../../middleware/admin-middleware";
import { querySchema, updateMetaDataSchema } from "@repo/common";
import { prisma } from "@repo/db/client";

export const userRoute = Router();

userRoute.post(
  "/metadata",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const data = req.body;

    try {
      const parsedData = updateMetaDataSchema.safeParse(data);
      if (!parsedData.success) {
        res.status(400).json({
          message: "Invalid data",
        });
        next();
      }

      const user = await prisma.user.update({
        where: {
          id: req.user?.id,
        },
        data: {
          avatarId: parsedData.data?.avatarId,
        },
      });

      res.status(200).json({
        message: "User metadata updated",
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      });
      console.log("Error in updateUserMetadata", error);
    }
  }
);

userRoute.get(
  "metadata/bulk",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const query = querySchema.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({
        message: "Invalid data",
      });
      next();
    }

    const userIds = query.data?.id.split(",");

    const metadata = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        avatar: true,
      },
    });

    res.status(200).json({
      message: "User metadata updated",
      data: metadata.map((x) => ({ id: x.id, avatarId: x.avatar?.imageUrl })),
    });
  }
);
