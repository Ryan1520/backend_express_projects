import { NextFunction, Request, Response } from "express";
import { db } from "../config/sqldb";
import User from "../model/User";
import { handleErrorWith } from "../utils/common";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// use `prisma` in your application to read and write data in your DB

const controller1 = async (req: Request, res: Response, next: NextFunction) => {
  handleErrorWith(next, "not_found", 404, { id: "123" });
};

const controller2 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.post.create({
      data: {
        title: "Hello World",
      },
    });
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error creating user",
      error: error,
    });
  }
};

const controller3 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // await User.create({
    //   name: "John Doe",
    //   email: "abcd",
    //   password: "123",
    // });

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user",
      error: error,
    });
  }
};

export default { controller1, controller2, controller3 };
