const express = require("express");
const passport = require("passport");
const prisma = require("../prisma");
const chatsRouter = express.Router();


chatsRouter.get('/', passport.authenticate("jwt"))


module.exports = chatsRouter;