const express = require("express");
const passport = require("passport");
const prisma = require("../prisma");
const filesRouter = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client, HeadObjectCommand } = require("@aws-sdk/client-s3");
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
      const safeName = file.originalname
        .replace(/ /g, "_")
        .replace(/[^\w\.\-]/g, "");
      cb(null, `uploads/${Date.now()}_${safeName}`);
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
    const files = await Promise.all(
      req.files.map(async (f) => {
        let fileSize = f.size;
        if (fileSize === 0) {
          const headObjectCommand = new HeadObjectCommand({
            Bucket: "krunpy-main",
            Key: f.key,
          });
          const headObject = await s3.send(headObjectCommand);
          fileSize = headObject.ContentLength;
        }
        return {
          url: f.location,
          name: f.originalname,
          size: fileSize,
        };
      })
    );
    res.json(files);
  }
);

filesRouter.post(
  "/cdn",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  async (req, res) => {
    const f = req.file;
    const cdnUrl = f.location.replace(
      "https://storage.yandexcloud.net/krunpy-main",
      "https://cdn.krunpy.ru"
    );
    return res.status(201).json({
      url: cdnUrl,
      name: f.originalname,
      size: f.size,
    });
  }
);
module.exports = filesRouter;
