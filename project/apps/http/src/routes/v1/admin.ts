import { NextFunction, Request, Response, Router } from "express";
import {
  createAnAvatar,
  createAnElement,
  createMap,
  updateAnElement,
} from "../../controller/admin-controller";

export const adminRoute = Router();

adminRoute.post("/element", createAnElement);
adminRoute.put("/element/:elementId", updateAnElement);
adminRoute.post("/avatar", createAnAvatar);
adminRoute.post("/map", createMap);
