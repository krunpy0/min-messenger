const express = require("express");
const mainRouter = express.Router();
const signUpRouter = require("./signUp");
const loginRouter = require("./login");
const meRouter = require("./me");
const userRouter = require("./user");

mainRouter.get("/", (req, res) => {
  res.json({ message: "hello world" });
});
mainRouter.use("/sign-up", signUpRouter);
mainRouter.use("/login", loginRouter);
mainRouter.use("/me", meRouter);
mainRouter.use("/user", userRouter);
module.exports = mainRouter;
