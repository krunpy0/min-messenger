const express = require("express");
const passport = require("passport");
const prisma = require("../prisma");
const friendsRouter = express.Router();

// Standardized response helper
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
    ...(data && { data })
  };
  return res.status(statusCode).json(response);
};

// Error handler helper
const handleError = (res, error, defaultMessage = "Unexpected server error") => {
  console.error("Friends API Error:", error);
  
  // Handle specific Prisma errors
  if (error.code === 'P2002') {
    return sendResponse(res, 409, false, "A record with this data already exists");
  }
  if (error.code === 'P2025') {
    return sendResponse(res, 404, false, "Record not found");
  }
  
  return sendResponse(res, 500, false, defaultMessage);
};

friendsRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const friends = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          friends: {
            include: {
              friend: {
                select: {
                  id: true,
                  username: true,
                }
              }
            }
          },
        },
      });
      
      if (!friends) {
        return sendResponse(res, 404, false, "User not found");
      }
      
      sendResponse(res, 200, true, "Friends retrieved successfully", friends.friends);
    } catch (error) {
      handleError(res, error, "Failed to retrieve friends list");
    }
  }
);

friendsRouter.get(
  "/requests/received",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const requests = await prisma.friendRequest.findMany({
        where: { toUserId: req.user.id, status: "pending" },
        include: {
          fromUser: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      sendResponse(res, 200, true, "Received friend requests retrieved successfully", requests);
    } catch (error) {
      handleError(res, error, "Failed to retrieve received friend requests");
    }
  }
);

friendsRouter.get("/requests/sent",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const requests = await prisma.friendRequest.findMany({
        where: { fromUserId: req.user.id, status: "pending" },
        include: {
          toUser: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      sendResponse(res, 200, true, "Sent friend requests retrieved successfully", requests);
    } catch (error) {
      handleError(res, error, "Failed to retrieve sent friend requests");
    }
  }
);


friendsRouter.post(
  "/requests/send/:friendId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { friendId } = req.params;
    try {
      if (friendId === req.user.id) {
        return sendResponse(res, 400, false, "You cannot send a friend request to yourself");
      }
      
      const user = await prisma.user.findUnique({
        where: { id: friendId },
        select: { id: true, username: true }
      });
      
      if (!user) {
        return sendResponse(res, 404, false, "User not found");
      }
      
      const existingFriendship = await prisma.friend.findFirst({
        where: {
          OR: [
            { userId: req.user.id, friendId },
            { userId: friendId, friendId: req.user.id },
          ],
        },
      });
      
      if (existingFriendship) {
        return sendResponse(res, 409, false, `You are already friends with ${user.username}`);
      }

      const existingRequest = await prisma.friendRequest.findFirst({
        where: {
          OR: [
            { fromUserId: req.user.id, toUserId: friendId, status: "pending" },
            { toUserId: req.user.id, fromUserId: friendId, status: "pending" },
          ],
        },
      });
      
      if (existingRequest) {
        return sendResponse(res, 409, false, "A friend request already exists between you and this user");
      }

      const friendRequest = await prisma.friendRequest.create({
        data: {
          fromUserId: req.user.id,
          toUserId: friendId,
          status: "pending",
        },
        include: {
          toUser: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
      
      sendResponse(res, 201, true, `Friend request sent to ${user.username}`, friendRequest);
    } catch (error) {
      handleError(res, error, "Failed to send friend request");
    }
  }
);

friendsRouter.put(
  "/requests/accept/:requestId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { requestId } = req.params;
    try {
      const friendRequest = await prisma.friendRequest.findFirst({
        where: {
          id: requestId,
          toUserId: req.user.id, // Ensure user can only accept requests sent to them
          status: "pending",
        },
        include: {
          fromUser: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
      
      if (!friendRequest) {
        return sendResponse(res, 404, false, "Friend request not found or you don't have permission to accept it");
      }

      await prisma.$transaction(async (tx) => {
        await tx.friendRequest.update({
          where: { id: friendRequest.id },
          data: { status: "accepted" },
        });

        await tx.friend.createMany({
          data: [
            {
              userId: friendRequest.fromUserId,
              friendId: friendRequest.toUserId,
            },
            {
              userId: friendRequest.toUserId,
              friendId: friendRequest.fromUserId,
            },
          ],
        });
      });
      
      sendResponse(res, 200, true, `Friend request from ${friendRequest.fromUser.username} accepted successfully`);
    } catch (error) {
      handleError(res, error, "Failed to accept friend request");
    }
  }
);

friendsRouter.put(
  "/requests/decline/:requestId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { requestId } = req.params;
    try {
      const friendRequest = await prisma.friendRequest.findFirst({
        where: {
          id: requestId,
          toUserId: req.user.id, // Ensure user can only decline requests sent to them
          status: "pending",
        },
        include: {
          fromUser: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
      
      if (!friendRequest) {
        return sendResponse(res, 404, false, "Friend request not found or you don't have permission to decline it");
      }

      await prisma.friendRequest.update({
        where: { id: friendRequest.id },
        data: { status: "declined" },
      });
      
      sendResponse(res, 200, true, `Friend request from ${friendRequest.fromUser.username} declined successfully`);
    } catch (error) {
      handleError(res, error, "Failed to decline friend request");
    }
  }
);

friendsRouter.delete(
  "/remove/:friendId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { friendId } = req.params;
    try {
      if (friendId === req.user.id) {
        return sendResponse(res, 400, false, "You cannot remove yourself as a friend");
      }
      
      const friendship = await prisma.friend.findFirst({
        where: {
          userId: req.user.id,
          friendId: friendId,
        },
        include: {
          friend: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
      
      if (!friendship) {
        return sendResponse(res, 404, false, "Friendship not found");
      }

      await prisma.$transaction(async (tx) => {
        // Remove both friendship records
        await tx.friend.deleteMany({
          where: {
            OR: [
              { userId: req.user.id, friendId: friendId },
              { userId: friendId, friendId: req.user.id },
            ],
          },
        });
        
        // Remove any related friend requests
        await tx.friendRequest.deleteMany({
          where: {
            OR: [
              { fromUserId: req.user.id, toUserId: friendId },
              { toUserId: req.user.id, fromUserId: friendId },
            ],
          },
        });
      });
      
      sendResponse(res, 200, true, `Successfully removed ${friendship.friend.username} from friends`);
    } catch (error) {
      handleError(res, error, "Failed to remove friend");
    }
  }
);



module.exports = friendsRouter;
