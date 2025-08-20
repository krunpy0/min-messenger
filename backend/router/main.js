const express = require("express");
const mainRouter = express.Router();
const signUpRouter = require("./signUp");
const loginRouter = require("./login");
const meRouter = require("./me");

mainRouter.get("/", (req, res) => {
  res.json({ message: "hello world" });
});
mainRouter.use("/sign-up", signUpRouter);
mainRouter.use("/login", loginRouter);
mainRouter.use("/me", meRouter);

module.exports = mainRouter;
