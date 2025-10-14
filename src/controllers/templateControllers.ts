import { NextFunction, Request, Response } from "express";
import { db } from "../config/sqldb";
import { handleErrorWith } from "../utils/common";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["query", "error"] });

const controller1 = (req: Request, res: Response, next: NextFunction) => {
  handleErrorWith(next, "not_found", 404, { id: "123" });
};
const controller2 = (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "controller2" });
};
const controller3 = (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "controller3" });
};

const controllerCreate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // create one user
    const user = await prisma.user.create({
      data: {
        email: "jonhdoe@gmail.com",
        name: "jonhdoe",
        age: 25,
        password: "hashed_password",
        userPreferences: {
          create: { emailUpdates: true },
        },
      },
      // include: { userPreferences: true },
      select: {
        name: true,
        userPreferences: {
          select: { emailUpdates: true },
        },
      },
    });

    // create many users
    //-----------------------------------------------
    // const users = await prisma.user.createMany({ |
    //   data: [                                    |
    //     {                                        |
    //       email: "jonhdoe@gmail.com",            |
    //       name: "jonhdoe",                       |
    //       age: 25,                               |
    //     },                                       |
    //     {                                        |
    //       email: "janedoe@gmail.com",            |
    //       name: "janedoe",                       |
    //       age: 27,                               |
    //     },                                       |
    //   ],                                         |
    // });                                          |
    //-----------------------------------------------

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const controllerRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const user = await prisma.user.findUnique({
    //   // where: { id: req.params.id },
    //   or:
    //   where: {
    //     email_name: {
    //       email: "",
    //       name: "",
    //     }
    //   },
    //   include: { userPreferences: true },
    // });
    const users = await prisma.user.findMany({
      where: {
        // name: "johndoe",
        name: { notIn: ["johndoe", "janedoe"] },
        email: { contains: "@gmail.com", startsWith: "j", endsWith: "com" },
        age: { gt: 25, lt: 30 },

        AND: [{ age: { not: 26 } }, { name: { not: "jimdoe" } }],

        writtenPosts: { some: { title: { contains: "1" } } },
      },
      orderBy: {
        age: "asc",
      },
      distinct: ["name", "age"],

      take: res.locals.pagination.limit,
      skip: res.locals.pagination.skip,

      include: { userPreferences: true },
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

const controllerUpdate = async (req: Request, res: Response, next: NextFunction) => {
  const updatedId = req.params.id;

  try {
    const user = await prisma.user.update({
      where: { id: updatedId },
      data: {
        name: "johndoe2updated",
        age: {
          increment: 1,
          // decrement: 1,
          // multiply: 2,
          // divide: 2,
        },
      },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const controllerDelete = async (req: Request, res: Response, next: NextFunction) => {
  const deletedId = req.params.id;

  try {
    const user = await prisma.user.delete({ where: { id: deletedId } });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export default { controller1, controller2, controller3, controllerCreate, controllerRead, controllerUpdate, controllerDelete };
