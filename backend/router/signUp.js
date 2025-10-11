const express = require("express");
const signUpRouter = express.Router();
const bcrypt = require("bcryptjs");
const prisma = require("../prisma");
const jwt = require("jsonwebtoken");

signUpRouter.post("/", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.body.username },
    });
    if (user) {
      return res.status(409).json({ message: "Username taken" });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = await prisma.user.create({
      data: { username: req.body.username, password: hashedPassword },
    });
    const payload = {
      id: newUser.id,
      username: newUser.username,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    console.log(newUser);
    res.status(201).json({ message: "Succesfully signed up" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = signUpRouter;
