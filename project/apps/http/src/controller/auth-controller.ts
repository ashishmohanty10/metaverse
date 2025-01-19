import { signInSchema, signUpSchema } from "@repo/common";
import { prisma } from "@repo/db/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import bcrypt from "bcrypt";

export async function signUpController(req: Request, res: Response) {
  const data = req.body;

  const parsedData = signUpSchema.safeParse(data);
  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid data",
      errors: parsedData.error.errors,
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role === "admin" ? "Admin" : "User",
      },
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        role: newUser.role,
      },
      config.jwtSecret as string
    );

    res.status(200).json({
      message: "User created",
      userId: newUser.id,
      accessToken: token,
    });
  } catch (error) {
    res.status(500).json({
      mesage: "Something went wrong",
    });
    console.log("Error in signup", error);
  }
}

export async function signInController(req: Request, res: Response) {
  const data = req.body;

  const parsedData = signInSchema.safeParse(data);
  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid data",
    });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      res.status(400).json({
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(data.password, user!.password);

    if (!isPasswordValid) {
      res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user?.id,
        role: user?.role,
      },
      config.jwtSecret as string
    );

    res.status(200).json({
      message: "User signed in",
      userId: user?.id,
      accessToken: token,
    });
  } catch (error) {
    res.status(500).json({
      mesage: "Something went wrong",
    });
    console.log("Error in signin", error);
  }
}
