const express = require("express");
const userRouter = express.Router();
const passport = require("passport");
const prisma = require("../prisma");

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
  console.error("User API Error:", error);
  
  // Handle specific Prisma errors
  if (error.code === 'P2002') {
    return sendResponse(res, 409, false, "A record with this data already exists");
  }
  if (error.code === 'P2025') {
    return sendResponse(res, 404, false, "Record not found");
  }
  
  return sendResponse(res, 500, false, defaultMessage);
};

userRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { username } = req.query;
    try {
      const users = await prisma.user.findMany({
        where: {
          username: {
            contains: username,
            mode: "insensitive",
            not: req.user.username,
          },
        },
        select: {
          id: true,
          username: true,
        },
        take: 10, // Limit results to prevent large responses
        orderBy: {
          username: 'asc'
        }
      });
      
      sendResponse(res, 200, true, "Users found successfully", users);
    } catch (error) {
      handleError(res, error, "Failed to search for users");
    }
  }
);

userRouter.get("/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.params;
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          bio: true,
        },
      });
      sendResponse(res, 200, true, "User retrieved successfully", user);
    } catch (error) {
      handleError(res, error, "Failed to retrieve user");
    }
  }
);

module.exports = userRouter;
