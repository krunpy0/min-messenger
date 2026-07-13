const express = require("express");
const passport = require("passport");
const filesRouter = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();

const {
  S3_REGION,
  S3_BUCKET,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_ENDPOINT,
  S3_PUBLIC_BASE_URL,
} = process.env;

const s3ClientConfig = {
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
};

if (S3_ENDPOINT) {
  s3ClientConfig.endpoint = S3_ENDPOINT;
  s3ClientConfig.forcePathStyle = true;
}

const s3 = new S3Client(s3ClientConfig);

function makeObjectKey(originalname) {
  const safeName = originalname.replace(/ /g, "_").replace(/[^\w\.\-]/g, "");
  return `${Date.now()}_${safeName}`;
}

function makeFileUrl(key, fallbackUrl) {
  if (S3_PUBLIC_BASE_URL) {
    return `${S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
  }

  return fallbackUrl;
}

const upload = multer({
  storage: multerS3({
    s3,
    bucket: S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, makeObjectKey(file.originalname));
    },
  }),
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
      const files = req.files.map((f) => ({
        url: makeFileUrl(f.key, f.location),
        name: f.originalname,
        size: f.size,
      }));

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

      return res.status(201).json({
        success: true,
        url: makeFileUrl(f.key, f.location),
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
