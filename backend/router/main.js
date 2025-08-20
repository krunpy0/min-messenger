const express = require("express");
const mainRouter = express.Router();
const signUpRouter = require("./signUp");

mainRouter.get("/", (req, res) => {
  res.json({ message: "hello world" });
});
mainRouter.use("/sign-up", signUpRouter);

module.exports = mainRouter;
