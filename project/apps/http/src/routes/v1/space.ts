import { Router } from "express";
import {
  addElement,
  createSpace,
  deleteElement,
  deleteSpaceById,
  getAllSpace,
  getBySpaceId,
} from "../../controller/space-controller";
import { userMiddleware } from "../../middleware/user-middleware";

export const spaceRoute = Router();

spaceRoute.post("/", userMiddleware, createSpace);
spaceRoute.delete("/:id", userMiddleware, deleteSpaceById);
spaceRoute.get("/all", getAllSpace);

spaceRoute.get("/:spaceId", getBySpaceId);
spaceRoute.post("/element", userMiddleware, addElement);
spaceRoute.delete("/element/:id", userMiddleware, deleteElement);
