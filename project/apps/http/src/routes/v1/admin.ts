import { Router } from "express";
import {
  createAnAvatar,
  createAnElement,
  createMap,
  updateAnElement,
} from "../../controller/admin-controller";
import { adminMiddleware } from "../../middleware/admin-middleware";

export const adminRoute = Router();

adminRoute.use(adminMiddleware);
adminRoute.post("/element", createAnElement);
adminRoute.put("/element/:elementId", updateAnElement);
adminRoute.post("/avatar", createAnAvatar);
adminRoute.post("/map", createMap);
