const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../prisma");

const loginRouter = express.Router();

loginRouter.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username and password can't be null" });
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const payload = {
      id: user.id,
      username: user.username,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.status(200).json({ message: "Successfully logged in" });
  } catch (err) {
    return res.status(500).json({ message: `error, ${err}` });
  }
});
module.exports = loginRouter;
