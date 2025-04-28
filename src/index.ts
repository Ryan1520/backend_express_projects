const port = process.env.PORT || 3500;

import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import { corsOrigin } from "./config/corsOptions";
import { logger } from "./middleware/logEvents";
import cookieParser from "cookie-parser";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";
import templateRoutes from "./routes/template";
import morgan from "morgan";
import mongoose from "mongoose";
import { connectToMongoDB } from "./config/mongodb";
import { getCliParameter } from "./utils/getCliParameter";

const app: Express = express();

const dbType = getCliParameter("db");

if (dbType == "mongo") {
  console.log("🔃 Connecting to MongoDB...");
  connectToMongoDB();
}

app.use(morgan("dev"));

// app.use(logger);

// Cross Origin Resource Sharing
app.use(cors(corsOrigin));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

//TODO: add routes here---------------------|
//                                          |
app.use("/template", templateRoutes); //example
//                                          |
// -----------------------------------------|

app.all("*", (req: Request, res: Response) => {
  res.status(404);

  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

if (dbType == "mongo") {
  mongoose.connection.once("open", () => {
    console.log("✅✅--< MongoDB connection established >--✅✅");
    app.listen(port, () => {
      console.log(`▶︎▶︎▶︎ Server is running on PORT: ${port} ◀︎◀︎◀︎`);
    });
  });
} else {
  app.listen(port, () => {
    console.log(`▶︎▶︎▶︎ Server is running on PORT: ${port} ◀︎◀︎◀︎`);
  });
}
