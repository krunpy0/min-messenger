const express = require("express");
const mainRouter = express.Router();
const signUpRouter = require("./signUp");
const loginRouter = require("./login");
const meRouter = require("./me");
const userRouter = require("./user");
const friendsRouter = require("./friends");
const chatsRouter = require("./chats");
const filesRouter = require("./files.js");

mainRouter.get("/", (req, res) => {
  res.json({ message: "hello world" });
});
mainRouter.use("/sign-up", signUpRouter);
mainRouter.use("/login", loginRouter);
mainRouter.use("/me", meRouter);
mainRouter.use("/user", userRouter);
mainRouter.use("/friends", friendsRouter);
mainRouter.use("/chats", chatsRouter);
mainRouter.use("/files", filesRouter);
mainRouter.post("/logout", (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ message: "Successfully logged out" });
  } catch (err) {
    console.error("Error in logout:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = mainRouter;
