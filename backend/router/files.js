const express = require("express");
const passport = require("passport");
const prisma = require("../prisma");
const filesRouter = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3 = new S3Client({
  region: "ru-central1",
  endpoint: "https://storage.yandexcloud.net/",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.YA_ACCESS_KEY,
    secretAccessKey: process.env.YA_SECRET_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: "krunpy-main",
    acl: "public-read",
    key: (req, file, cb) => {
      cb(null, `uploads/${Date.now()}_${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

filesRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  upload.array("files[]"),
  async (req, res) => {
    const files = req.files.map((f) => ({
      url: f.location,
      name: f.originalname,
      size: f.size,
    }));
    res.json({ files });
  }
);

module.exports = filesRouter;
