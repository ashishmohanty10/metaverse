import {
  addElementSchema,
  createSpaceSchema,
  deleteElementSchema,
} from "@repo/common";
import { prisma } from "@repo/db/client";
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/admin-middleware";

export async function createSpace(req: AuthRequest, res: Response) {
  console.log("createSpace route post");
  console.log(req.body, "req.body from createSpace route");
  const parsedData = createSpaceSchema.safeParse(req.body);

  console.log("parsedData", parsedData);

  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid data",
    });
    return;
  }

  if (!parsedData.data.mapId) {
    const space = await prisma.space.create({
      data: {
        name: parsedData.data.name,
        width: parseInt(parsedData.data.dimensions.split("x")[0]),
        height: parseInt(parsedData.data.dimensions.split("x")[1]),
        creatorId: req.user?.id as string,
      },
    });

    res.json({
      message: "Space created",
      spaceId: space.id,
    });

    return;
  }

  const map = await prisma.map.findUnique({
    where: {
      id: parsedData.data.mapId,
    },
    select: {
      width: true,
      height: true,
      mapElements: true,
    },
  });
  console.log("map", map);

  if (!map) {
    res.status(400).json({
      message: "Map not found",
    });
  }

  const space = await prisma.$transaction(async () => {
    const space = await prisma.space.create({
      data: {
        name: parsedData.data.name,
        width: map!.width,
        height: map!.height,
        creatorId: req.user?.id as string,
      },
    });

    await prisma.spaceElements.createMany({
      data: map!.mapElements.map((x) => ({
        spaceId: space.id,
        elementId: x.elementId,
        x: x.x!,
        y: x.y!,
      })),
    });

    return space;
  });

  res.json({
    message: "Space created",
    spaceId: space.id,
  });
}

export async function deleteSpaceById(req: AuthRequest, res: Response) {
  console.log("deleteSpaceById route", req.params);
  const parsedData = deleteElementSchema.safeParse(req.params);
  console.log("parsedData", parsedData);
  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid data",
    });
    return;
  }

  const space = await prisma.space.findUnique({
    where: {
      id: parsedData.data.id,
    },
    select: {
      creatorId: true,
    },
  });

  if (!space) {
    res.status(404).json({
      message: "Space not found",
    });
    return;
  }

  if (space?.creatorId !== req.user?.id) {
    res.status(403).json({
      message: "You are not authorized to delete this space",
    });
    return;
  }

  await prisma.space.delete({
    where: {
      id: parsedData.data.id,
    },
  });

  res.status(200).json({
    message: "Space deleted",
    spaceId: parsedData.data.id,
  });
}

export async function addElement(req: AuthRequest, res: Response) {
  const parsedData = addElementSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid data",
    });
    return;
  }

  try {
    const space = await prisma.space.findUnique({
      where: {
        id: parsedData.data.spaceId,
        creatorId: req.user?.id,
      },
      select: {
        width: true,
        height: true,
      },
    });

    if (parsedData.data.x > space!.width || parsedData.data.y > space!.height) {
      res.status(400).json({
        message: "Element is out of bounds",
      });
      return;
    }

    await prisma.spaceElements.create({
      data: {
        spaceId: parsedData.data.spaceId,
        elementId: parsedData.data.elementId,
        x: parsedData.data.x,
        y: parsedData.data.y,
      },
    });

    res.json({
      message: "Element added to space",
      elementId: parsedData.data.elementId,
    });
  } catch (error) {
    console.log("Error while adding element to space", error);
  }
}

export async function deleteElement(req: Request, res: Response) {
  const parsedData = deleteElementSchema.safeParse(req.params);

  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid data",
    });
    return;
  }

  const spaceElements = await prisma.spaceElements.findUnique({
    where: {
      id: parsedData.data.id,
    },
    include: {
      space: true,
    },
  });

  if (!spaceElements?.space.creatorId) {
    res.status(403).json({
      message: "You are not authorized to delete this space",
    });
    return;
  }

  await prisma.spaceElements.delete({
    where: {
      id: parsedData.data.id,
    },
  });
  res.status(200).json({
    message: "Space deleted",
    spaceId: parsedData.data.id,
  });
}

export async function getAllSpace(req: AuthRequest, res: Response) {
  try {
    const allSpaces = await prisma.space.findMany({
      where: {
        creatorId: req.user?.id,
      },
    });

    res.status(200).json({
      spaces: allSpaces.map((x) => ({
        id: x.id,
        name: x.name,
        dimension: `${x.width}x${x.height}`,
      })),
    });
  } catch (error) {
    console.error("Error while fetching spaces", error);
  }
}

export async function getBySpaceId(req: Request, res: Response) {
  console.log("getBySpaceId route", req.params);
  try {
    const spaceId = await prisma.space.findUnique({
      where: {
        id: req.params.spaceId,
      },
      include: {
        elements: {
          include: {
            element: true,
          },
        },
      },
    });

    console.log("spaceId", spaceId);

    if (!spaceId) {
      res.status(404).json({
        message: "Space not found",
      });
    }

    console.log("spaceId", `${spaceId?.width}x${spaceId?.height}`);

    res.status(200).json({
      message: "Space fetched",
      dimension: `${spaceId?.width}x${spaceId?.height}`,
      elements: spaceId?.elements.map((x) => ({
        id: x.id,
        x: x.x,
        y: x.y,
        element: {
          id: x.element.id,
          imageUrl: x.element.imageUrl,
          width: x.element.width,
          height: x.element.height,
          static: x.element.static,
        },
      })),
    });
  } catch (error) {
    console.error("Error while fetching spaces by id", error);
  }
}
