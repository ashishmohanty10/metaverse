import { Router } from "express";
import {
  addElement,
  createSpace,
  deleteElement,
  deleteSpaceById,
  getAllSpace,
  getBySpaceId,
} from "../../controller/space-controller";

export const spaceRoute = Router();

spaceRoute.post("/", createSpace);
spaceRoute.delete("/:spaceId", deleteSpaceById);
spaceRoute.get("/all", getAllSpace);

spaceRoute.get("/:spaceId", getBySpaceId);
spaceRoute.post("/element", addElement);
spaceRoute.delete("/element", deleteElement);
