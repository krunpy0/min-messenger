const express = require("express");
const passport = require("passport");
const prisma = require("../prisma");
const friendsRouter = express.Router();

friendsRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // req.user = { id: 'a741a58f-a1b0-4899-8f88-0f6714fc939e', username: 'krunpy' }
    try {
      const friends = await prisma.user.findUnique({
        where: { id: req.user.id },
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

friendsRouter.get("/requests");

friendsRouter.post(
  "/send/:friendId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { friendId } = req.params;
    try {
      if (friendId === req.user.id) {
        res
          .status(400)
          .json({ message: "You can't send friend request to yourself" });
      }
      const user = await prisma.user.findUnique({
        where: { id: friendId },
      });
      if (!user) return res.status(404).json({ message: "User not found" });
      const existingFriendship = await prisma.friend.findFirst({
        where: {
          OR: [
            { userId: req.user.id, friendId },
            { userId: friendId, friendId: req.user.id },
          ],
        },
      });
      if (existingFriendship)
        return res
          .status(409)
          .json({ message: "You are already friends with user" });

      const existingRequest = await prisma.friendRequest.findFirst({
        where: {
          OR: [
            { fromUser: req.user.id, toUser: friendId },
            { toUser: req.user.id, fromUser: friendId },
          ],
        },
      });
      if (existingRequest)
        return res.status(409).json({ message: "Request already sent" });

      const friendRequest = await prisma.friendRequest.create({
        data: {
          fromUser: req.user.id,
          toUser: friendId,
          status: "pending",
        },
      });
      res.status(201).json(friendRequest);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Unexpected server error" });
    }
  }
);

friendsRouter.post(
  "/accept/:friendId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { friendId } = req.params;
    try {
      const friendRequest = await prisma.friendRequest.findFirst({
        where: { fromUser: friendId, toUser: req.user.id, status: "pending" },
      });
      if (!friendRequest)
        return res.status(404).json({ message: "Friend request not found" });

      await prisma.$transaction(async (prisma) => {
        await prisma.friendRequest.update({
          where: { id: friendRequest.id },
          data: { status: "accepted" },
        });
        await prisma.friend.createMany({
          data: [
            { userId: req.user.id, friendId },
            { userId: friendId, friendId: req.user.id },
          ],
        });
      });
      res.status(200).json({ message: "Friend request accepted" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Unexpected server error" });
    }
  }
);

friendsRouter.post(
  "/decline/:friendId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { friendId } = req.params;
    try {
      const friendRequest = await prisma.friendRequest.findFirst({
        where: { fromUser: friendId, toUser: req.user.id, status: "pending" },
      });
      if (!friendRequest)
        return res.status(404).json({ message: "Friend request not found" });

      await prisma.friendRequest.update({
        where: { id: friendRequest.id },
        data: { status: "declined" },
      });
      res.status(200).json({ message: "Friend request declined" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Unexpected server error" });
    }
  }
);

module.exports = friendsRouter;
