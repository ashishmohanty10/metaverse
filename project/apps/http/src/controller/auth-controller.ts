import { signInSchema, signUpSchema } from "@repo/common";
import { prisma } from "@repo/db/client";
import { Request, Response } from "express";
import jwt, { decode } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "../config/config";
import { Role } from "@prisma/client";

export async function signUpController(req: Request, res: Response) {
  const data = req.body;

  const parsedData = signUpSchema.safeParse({
    email: data.email,
    password: data.password,
    name: data.name,
    role: data.role ? data.role : Role.USER,
  });

  if (!parsedData.success) {
    res.status(400).json({
      success: false,
      message: "Invalid data",
      errors: parsedData.error.errors,
    });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: parsedData.data.email },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: parsedData.data.name,
        email: parsedData.data.email,
        password: hashedPassword,

        // @ts-ignore
        role: parsedData.data.role || Role.USER,
      },
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      config.jwtSecret as string,
      { expiresIn: "7d" }
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
    });

    console.log(decode(token), "decoded token");

    res.status(201).json({
      message: "User created successfully",
      userId: newUser.id,
      accessToken: token,
    });
    return;
  } catch (error) {
    console.error("Error in signUpController:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
}

export async function signInController(
  req: Request,
  res: Response
): Promise<any> {
  const data = req.body;

  const parsedData = signInSchema.safeParse(data);
  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid data",
      errors: parsedData.error.errors,
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsedData.data.email },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      parsedData.data.password,
      user.password
    );

    if (!isPasswordValid) {
      res.status(401).json({
        message: "Invalid credentials",
      });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwtSecret as string,
      { expiresIn: "7d" }
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      userId: user.id,
      accessToken: token,
    });
    return;
  } catch (error) {
    console.error("Error in signInController:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
}
