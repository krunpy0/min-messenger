const express = require("express");
const passport = require("passport");
const meRouter = express.Router();

meRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req.user);
    return res.status(200).json({ user: req.user });
  }
);

module.exports = meRouter;
