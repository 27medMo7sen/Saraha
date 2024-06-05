import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import { ioGeneration, getIo } from "./src/utils/ioGeneration.js";
config({ path: path.resolve("./config/config.env") });

const app = express();
const port = process.env.PORT || 8000; // Ensure a default port is provided

import { connectionDB } from "./DB/connection.js";
import * as allRouter from "./src/modules/index.routes.js";
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());
connectionDB();

app.get("/", (req, res) => res.send("Hello World!"));
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use("/uploads", express.static("./uploads"));

app.use("/user", allRouter.userRouter);
app.use("/chat", allRouter.chatRouter);

app.all("*", (req, res, next) =>
  res.status(404).json({ message: "404 Not Found URL" })
);

app.use((err, req, res, next) => {
  if (err) {
    return res.status(err["cause"] || 500).json({ message: err.message });
  }
});
const serverApp = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
const io = ioGeneration(serverApp, "http://localhost:3000");
getIo().on("connection", (socket) => {
  console.log("user is connected ", socket.id);
});
