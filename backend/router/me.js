const express = require("express");
const passport = require("passport");
const prisma = require("../prisma");
const meRouter = express.Router();

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
  console.error("Profile API Error:", error);
  
  // Handle specific Prisma errors
  if (error.code === 'P2002') {
    return sendResponse(res, 409, false, "A record with this data already exists");
  }
  if (error.code === 'P2025') {
    return sendResponse(res, 404, false, "Record not found");
  }
  
  return sendResponse(res, 500, false, defaultMessage);
};

meRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req.user);
    return res.status(200).json({ user: req.user });
  }
);

meRouter.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { username, bio, avatarUrl } = req.body;
    const userId = req.user.id;

    try {
      // Validate input data
      if (!username && !bio && !avatarUrl) {
        return sendResponse(res, 400, false, "At least one field must be provided for update");
      }

      // Check if username is being updated and if it's already taken
      if (username && username !== req.user.username) {
        const existingUser = await prisma.user.findUnique({
          where: { username },
          select: { id: true }
        });
        
        if (existingUser) {
          return sendResponse(res, 409, false, "Username is already taken");
        }
      }

      // Prepare update data
      const updateData = {};
      if (username) updateData.username = username;
      if (bio !== undefined) updateData.bio = bio;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true
        }
      });

      sendResponse(res, 200, true, "Profile updated successfully", updatedUser);
    } catch (error) {
      handleError(res, error, "Failed to update profile");
    }
  }
);

module.exports = meRouter;
