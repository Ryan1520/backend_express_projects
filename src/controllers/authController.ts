import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { isEmpty, omit } from "lodash";
import { handleErrorWith } from "../utils/common";
import { ErrorTypeE } from "../common/enums";

const prisma = new PrismaClient({ log: ["query", "error"] });

const handleRegistration = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return handleErrorWith(next, "Username and password are required", 400, { code: ErrorTypeE.INVALID_REQUEST });
  }

  const dupicated = await prisma.user.findUnique({ where: { email: username } }); // change unique value to duplicate here

  if (dupicated || !isEmpty(dupicated))
    return handleErrorWith(next, "Username already exists", 409, { username, code: ErrorTypeE.DUPLICATED });

  try {
    const hashedPwd = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      // change data to fill in DB
      data: {
        email: username,
        name: username,
        password: hashedPwd,
      },
    });

    console.log(newUser);

    res.status(201).json({ message: `New user ${username} created` });
  } catch (error) {
    return next(error);
  }
};

const handleLogin = async (req: Request, res: Response, next: NextFunction) => {
  const cookies = req.cookies;
  const { username, password } = req.body;

  if (!username || !password) {
    return handleErrorWith(next, "Username and password are required", 400, { code: ErrorTypeE.INVALID_REQUEST });
  }

  const foundUser = await prisma.user.findUnique({ where: { email: username } });

  if (!foundUser || isEmpty(foundUser))
    return handleErrorWith(next, "Unauthorized", 401, { username, password, code: ErrorTypeE.NOT_FOUND });

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) return handleErrorWith(next, "Unauthorized", 401, { username, password, code: ErrorTypeE.NOT_MATCH });

  const accessToken = jwt.sign(
    {
      userInfo: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
      },
    },
    process.env.ACCESS_TOKEN_SECRET || "",
    { expiresIn: "20s" } //change expiration time as needed
  );

  const refreshToken = jwt.sign(
    { id: foundUser.id, email: foundUser.email, name: foundUser.name },
    process.env.REFRESH_TOKEN_SECRET || "",
    { expiresIn: "7d" }
  );

  const currentRefreshTokenArray = (foundUser?.refreshToken ?? []) as string[];

  let newRefreshTokenArray = !cookies?.jwt
    ? currentRefreshTokenArray
    : currentRefreshTokenArray.filter((token) => token !== cookies.jwt);

  if (cookies?.jwt) {
    const refreshTokenInCookie = cookies.jwt;

    const foundToken = await prisma.user.findFirst({ where: { refreshToken: { array_contains: [refreshTokenInCookie] } } });

    if (!foundToken) {
      console.log("Attempted refresh token reuse at login!");
      newRefreshTokenArray = [];
    }

    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  }

  await prisma.user.update({
    where: { id: foundUser.id },
    data: { refreshToken: [...newRefreshTokenArray, refreshToken] },
  });

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // change existing time as needed
  });

  res.json({ ...omit(foundUser, "password"), accessToken, refreshToken });
};

const handleRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return handleErrorWith(next, "Unauthorized", 401, { code: ErrorTypeE.UNAUTHORIZED });

  const refreshToken = cookies.jwt;

  const foundUser = await prisma.user.findFirst({ where: { refreshToken: { array_contains: [refreshToken] } } });

  if (!foundUser) {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "", async (err: any, decoded: any) => {
      if (err) return handleErrorWith(next, "Forbidden", 403, { code: ErrorTypeE.FORBIDDEN });
      console.log("Attempted refresh token reuse!");

      const hackedUser = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!hackedUser) return next();

      await prisma.user.update({
        where: { id: hackedUser.id },
        data: { refreshToken: [] },
      });
    });

    return handleErrorWith(next, "Forbidden", 403, { code: ErrorTypeE.FORBIDDEN });
  }

  const newRefreshTokenArray = !cookies?.jwt
    ? (foundUser.refreshToken as string[])
    : (foundUser.refreshToken as string[]).filter((rt) => rt !== cookies.jwt);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "", async (err: any, decoded: any) => {
    if (err) {
      await prisma.user.update({ where: { id: foundUser.id }, data: { refreshToken: [] } });
    }

    if (err || foundUser.id !== decoded.id) return handleErrorWith(next, "Forbidden", 403, { code: ErrorTypeE.FORBIDDEN });

    const accessToken = jwt.sign(
      {
        userInfo: {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
        },
      },
      process.env.ACCESS_TOKEN_SECRET || "",
      { expiresIn: "20s" }
    );

    const newRefreshToken = jwt.sign(
      { id: foundUser.id, email: foundUser.email, name: foundUser.name },
      process.env.REFRESH_TOKEN_SECRET || "",
      { expiresIn: "7d" }
    );

    await prisma.user.update({
      where: { id: foundUser.id },
      data: { refreshToken: [...newRefreshTokenArray, newRefreshToken] },
    });

    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });

    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, refreshToken: newRefreshToken });
  });
};

const handleLogout = async (req: Request, res: Response, next: NextFunction) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;

  const foundUser = await prisma.user.findFirst({ where: { refreshToken: { array_contains: [refreshToken] } } });

  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    return res.sendStatus(204);
  }

  const filteredRefreshTokenArray = (foundUser.refreshToken as string[]).filter((rt) => rt !== refreshToken);

  await prisma.user.update({
    where: { id: foundUser.id },
    data: { refreshToken: filteredRefreshTokenArray },
  });

  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  res.sendStatus(204);
};

export default { handleRegistration, handleLogin, handleRefreshToken, handleLogout };
