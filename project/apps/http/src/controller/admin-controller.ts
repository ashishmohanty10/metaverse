import {
  createAnAvatarSchema,
  createElementSchema,
  createMapSchema,
  updateAnElementSchema,
} from "@repo/common";
import { prisma } from "@repo/db/client";
import { Response } from "express";
import { AuthRequest } from "../middleware/admin-middleware";

export async function createAnElement(req: AuthRequest, res: Response) {
  const parsedData = createElementSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid data",
    });
    return;
  }

  try {
    const element = await prisma.element.create({
      data: {
        imageUrl: parsedData.data.imageUrl,
        width: parsedData.data.width,
        height: parsedData.data.height,
        static: parsedData.data.static,
      },
    });

    res.status(200).json({
      message: "Element created",
      elementId: element.id,
    });
  } catch (error) {
    console.log("Error while creating an element", error);
  }
}

export async function updateAnElement(req: AuthRequest, res: Response) {
  const parsedData = updateAnElementSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid data",
    });
    return;
  }

  try {
    const newElement = await prisma.element.update({
      where: {
        id: req.params.elementId,
      },
      data: {
        imageUrl: parsedData.data.imageUrl,
      },
    });

    res.status(200).json({
      message: "Element updated",
      elementId: newElement.id,
    });
  } catch (error) {
    console.log("Error while updating an element", error);
  }
}

export async function createAnAvatar(req: AuthRequest, res: Response) {
  console.log("inside create avatar route");
  const parsedData = createAnAvatarSchema.safeParse(req.body);
  console.log(parsedData, "parsedData from createAnAvatar");

  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid data",
    });
    return;
  }

  try {
    const avatar = await prisma.avatar.create({
      data: {
        name: parsedData.data.name,
        imageUrl: parsedData.data.imageUrl,
      },
    });

    console.log(avatar.id, "avatar id from admin controller");

    res.status(200).json({
      message: "Avatar created",
      avatarId: avatar.id,
    });
  } catch (error) {
    console.log("Error while creating an avatar", error);
  }
}

export async function createMap(req: AuthRequest, res: Response) {
  console.log("inside create map route");
  const parsedData = createMapSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid data",
    });
    return;
  }

  try {
    const map = await prisma.map.create({
      data: {
        name: parsedData.data.name,
        width: parseInt(parsedData.data.dimensions.split("x")[0]),
        height: parseInt(parsedData.data.dimensions.split("x")[1]),
        thumbnail: parsedData.data.thumbnail,
        mapElements: {
          create: parsedData.data.defaultElements.map((e) => ({
            elementId: e.elementId,
            x: e.x,
            y: e.y,
          })),
        },
      },
    });

    res.status(200).json({
      message: "Map created",
      mapId: map.id,
    });
  } catch (error) {
    console.log("error while creating maps", error);
  }
}
