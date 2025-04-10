import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { VerifyErrors, VerifyOptions } from "jsonwebtoken";
import { db } from "../config/sqldb";

import { RegisterRequestI, UserResponseI } from "../interfaces/authInterface";

const checkIsUserDuplicated = async (email: string) => {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS count FROM users WHERE email = ?`,
    [email]
  );

  return (rows as any)[0].count > 0;
};

const register = async (
  req: Request<void, void, RegisterRequestI>,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "username and password are required" });
    return;
  }

  const isDuplicated = await checkIsUserDuplicated(email);
  if (isDuplicated) {
    res.sendStatus(409);
    return;
  }

  try {
    const hashedPwd = await bcrypt.hash(password, 10);

    await db.execute(`INSERT INTO users (email, password) VALUES (?, ?)`, [
      email,
      hashedPwd,
    ]);

    res.status(201).json({ status: "ok", message: "New user created!" });
  } catch (err) {
    next(new Error("INTERNAL_SERVER_ERROR"));
  }
};

const login = async (
  req: Request<void, void, RegisterRequestI>,
  res: Response
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "username and password are required" });
    return;
  }

  const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);

  const foundUser: UserResponseI = (rows as any)[0];
  if (!foundUser) {
    res.status(401).json({ status: "fail", message: "user not found" });
    return;
  }

  const isPasswordMatch = await bcrypt.compare(password, foundUser.password);

  if (isPasswordMatch) {
    const accessToken = jwt.sign(
      {
        email: foundUser.email,
      },
      process.env.ACCESS_TOKEN_SECRET || "",
      {
        expiresIn: "30s",
      }
    );

    const refreshToken = jwt.sign(
      {
        email: foundUser.email,
      },
      process.env.REFRESH_TOKEN_SECRET || "",
      {
        expiresIn: "1d",
      }
    );

    await db.execute(`UPDATE users SET refresh_token = ? WHERE email = ?`, [
      refreshToken,
      email,
    ]);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      accessToken,
    });
  } else {
    res.status(401).json({ status: "fail", message: "user not found" });
    return;
  }
};

const refresh = async (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies || !cookies?.jwt) {
    res.sendStatus(401);
    return;
  }

  const refreshToken = cookies.jwt;

  const [rows] = await db.execute(
    `SELECT * FROM users WHERE refresh_token = ?`,
    [refreshToken]
  );

  const foundUser: UserResponseI = (rows as any)[0];
  if (!foundUser) {
    res.sendStatus(403);
    return;
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET || "",
    (err: any, decoded: any) => {
      if (err || foundUser.email !== decoded.email) {
        res.sendStatus(403);
        return;
      }

      const accessToken = jwt.sign(
        {
          email: decoded.email,
        },
        process.env.ACCESS_TOKEN_SECRET || "",
        {
          expiresIn: "30s",
        }
      );

      res.status(200).json({ accessToken });
    }
  );
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  const cookies = req.cookies;

  if (!cookies || !cookies?.jwt) {
    res.sendStatus(401);
    return;
  }

  const refreshToken = cookies.jwt;

  const [rows] = await db.execute(
    `SELECT * FROM users WHERE refresh_token = ?`,
    [refreshToken]
  );

  const foundUser: UserResponseI = (rows as any)[0];
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    res.sendStatus(403);
    return;
  }

  try {
    await db.execute(
      `UPDATE users SET refresh_token = NULL WHERE refresh_token = ?`,
      [refreshToken]
    );
    res.status(200).json({ status: "ok", message: "logout" });
  } catch (error) {
    next(new Error("INTERNAL_SERVER_ERROR"));
  }
};

export default { register, login, refresh, logout };
