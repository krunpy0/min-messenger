const express = require("express");
const userRouter = express.Router();
const passport = require("passport");
const prisma = require("../prisma");

userRouter.get(
  "/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const username = req.params;
    try {
      const user = await prisma.user.findMany({
        where: username,
        select: {
          username: true,
          id: true,
        },
      });
      console.log(user);
      if (!user) {
        return res.status(404).json({ message: "Not found" });
      }
      res.status(200).json(user);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: `unexpected error` });
    }
  }
);
module.exports = userRouter;
