import { Router } from "express";

export const authRoute = Router();

authRoute.post("/signup");
authRoute.post("/signin");
