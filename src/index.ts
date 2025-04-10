const port = process.env.PORT || 3500;

import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsOrigin } from "./config/corsOptions";
import { logger } from "./middleware/logEvents";
import cookieParser from "cookie-parser";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

import authRouter from "./routes/auth";
import { verifyJWT } from "./middleware/verifyJWT";

const app: Express = express();

app.use(logger);

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
app.use('/auth', authRouter)

//Add required authentication route here
app.use(verifyJWT)
app.get('/test', (req: Request, res: Response) => {
  res.status(200).send('test ok')
})

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

app.listen(port, () => {
  console.log(`▶︎▶︎▶︎ Server is running on PORT: ${port} ◀︎◀︎◀︎`);
});
