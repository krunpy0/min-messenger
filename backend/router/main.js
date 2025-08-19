const express = require("express");
const mainRouter = express.Router();

mainRouter.get("/", (req, res) => {
  res.json({ message: "hello world" });
});

module.exports = mainRouter;
