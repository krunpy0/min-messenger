const express = require("express");
const signUpRouter = express.Router();
const bcrypt = require("bcryptjs");
const prisma = require("../prisma");

signUpRouter.post("/", async (req, res) => {
  console.log(req);
  const user = await prisma.user.findUnique({
    where: { username: req.body.username },
  });
  if (user) {
    return res.status(409).json({ message: "Username taken" });
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  try {
    const newUser = await prisma.user.create({
      data: { username: req.body.username, password: hashedPassword },
    });
    console.log(newUser);
    res.status(201).json({ message: "Succesfully signed in" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
});

module.exports = signUpRouter;
