import express from "express";
import path from "path";

import { config } from "dotenv";
config({ path: path.resolve("./config/config.env") });

const app = express();
const port = process.env.PORT;

import { connectionDB } from "./DB/connection.js";
import * as allRouter from "./src/modules/index.routes.js";

app.use(express.json());
connectionDB();

app.get("/", (req, res) => res.send("Hello World!"));
app.use("/uploads", express.static("./uploads"));

app.use("/user", allRouter.userRouter);
app.use("/msg", allRouter.messageRouter);

app.all("*", (req, res, next) =>
  res.status(404).json({ message: "404 Not Found URL" })
);

app.use((err, req, res, next) => {
  if (err) {
    return res.status(err["cause"] || 500).json({ message: err.message });
  }
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
