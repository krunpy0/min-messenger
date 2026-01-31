const express = require("express");
const passport = require("passport");
const prisma = require("../prisma");
const filesRouter = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const uploadsDir = path.join(__dirname, "..", "media");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/ /g, "_")
      .replace(/[^\w\.\-]/g, "");
    const uniqueName = `${Date.now()}_${safeName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000 * 1024 * 1024,
  },
});

filesRouter.post(
  "/storage",
  passport.authenticate("jwt", { session: false }),
  upload.array("files[]"),
  async (req, res) => {
    try {
      const protocol = req.protocol;
      const host = req.get("host");
      const baseUrl = `${protocol}://${host}`;
      
      const files = req.files.map((f) => {
        const filename = f.filename;
        return {
          url: `${baseUrl}/media/${filename}`,
          name: f.originalname,
          size: f.size,
        };
      });
      res.json(files);
    } catch (err) {
      console.error("Error in /storage:", err);
      res.status(500).json({
        success: false,
        message: "Failed to upload files",
      });
    }
  }
);

filesRouter.post(
  "/cdn",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  async (req, res) => {
    try {
      const f = req.file;
      if (!f) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const protocol = req.protocol;
      const host = req.get("host");
      const baseUrl = `${protocol}://${host}`;
      
      const filename = f.filename;
      return res.status(201).json({
        success: true,
        url: `${baseUrl}/media/${filename}`,
        name: f.originalname,
        size: f.size,
      });
    } catch (err) {
      console.error("Error in /cdn:", err);
      res.status(500).json({
        success: false,
        message: "Failed to upload file",
      });
    }
  }
);
module.exports = filesRouter;
