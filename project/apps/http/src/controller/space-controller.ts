import { NextFunction, Request, Response } from "express";

export async function createSpace(
  req: Request,
  res: Response,
  next: NextFunction
) {}

export async function deleteSpaceById(
  req: Request,
  res: Response,
  next: NextFunction
) {}

export async function getAllSpace(
  req: Request,
  res: Response,
  next: NextFunction
) {}

export async function getBySpaceId(
  req: Request,
  res: Response,
  next: NextFunction
) {}

export async function addElement(
  req: Request,
  res: Response,
  next: NextFunction
) {}

export async function deleteElement(
  req: Request,
  res: Response,
  next: NextFunction
) {}
