const express = require("express");
const passport = require("passport");
const prisma = require("../prisma");
const friendsRouter = express.Router();

friendsRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const friends = await prisma.user.findUnique({
        where: (id = req.user.id),
        select: {
          friends: true,
        },
      });
      console.log(friends);
      res.status(200).json(friends);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Unexpected server error" });
    }
  }
);

module.exports = friendsRouter;
