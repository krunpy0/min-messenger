const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("./passport");
const prisma = require("./prisma");
const jwt = require("jsonwebtoken");
const { instrument } = require("@socket.io/admin-ui");
const mime = require("mime-types");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const mainRouter = require("./router/main");
const { socket } = require("../frontend/src/socket");

app.use("/api", mainRouter);
app.get("/", (req, res) => {
  console.log(req.cookies);
});

const io = require("socket.io")(8080, {
  cors: {
    origin: ["http://localhost:5173", "https://admin.socket.io"],
    credentials: true,
  },
});

const userIo = io.of("/user");
userIo.on("connection", (socket) => {
  console.log("Connected to userspace" + socket.username);
});

userIo.use((socket, next) => {
  if (socket.handshake.token) {
    socket.username = socket.handshake.token;
    next();
  } else {
    next(new Error("No token"));
  }
});

function determineMimeType(nameOrUrl) {
  const fallback = "application/octet-stream";
  if (!nameOrUrl) return fallback;
  const guessed = mime.lookup(nameOrUrl);
  return typeof guessed === "string" ? guessed : fallback;
}

async function createMessage(cookieHeader, chatId, text, files) {
  try {
    const cookies = Object.fromEntries(
      cookieHeader?.split("; ").map((c) => c.split("="))
    );
    const token = cookies?.token; // если твой токен в cookie называется 'token'
    if (!token) throw new Error("No token provided");
    console.log(token);
    // проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    const userId = decoded.id;
    console.log(userId);
    // Build create payload and include file attachments only when provided
    const data = {
      text,
      userId,
      chatId,
    };

    if (Array.isArray(files) && files.length > 0) {
      // Expect files as { url, name, size }
      data.files = {
        create: files
          .filter((f) => f && f.url)
          .map((file) => ({
            url: file.url,
            type: determineMimeType(file.name || file.url),
            size: Number.isFinite(file.size) ? file.size : 0,
            name: file.name,
          })),
      };
    }

    const message = await prisma.message.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        files: true,
      },
    });
    return message;
  } catch (err) {
    console.log(err);
    return null;
  }
}
async function deleteMessage(cookieHeader, chatId, message) {
  try {
    console.log(`deleting message ${message}`);
    const cookies = Object.fromEntries(
      cookieHeader?.split("; ").map((c) => c.split("="))
    );
    const token = cookies?.token;
    if (!token) throw new Error("No token provided");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    const userId = decoded.id;
    console.log(`user trying to delete: ${userId}, ${message.userId}`);

    if (userId !== message.userId)
      throw new Error("You are not allowed to delete this message");

    const deletedMessage = await prisma.message.update({
      where: { id: message.id, chatId: chatId },
      data: { deleted: true },
      include: { files: true },
    });

    Promise.all(message.files.map((file) => deleteFileFromBucket(file)));
    return deletedMessage;
  } catch (err) {
    console.log("Error in deleteMessage:", err);
    return null;
  }
}

async function editMessage(cookieHeader, chatId, message, newText) {
  try {
    const cookies = Object.fromEntries(
      cookieHeader?.split("; ").map((c) => c.split("="))
    );
    const token = cookies?.token;
    if (!token) throw new Error("No token provided");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    const userId = decoded.id;
    // console.log(userId);
    console.log(message, newText);
    if (userId !== message.userId)
      throw new Error("You are not allowed to edit this message");

    const editedMessage = await prisma.message.update({
      where: { id: message.id, chatId: chatId },
      data: { text: newText },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        files: true,
      },
    });
    return editedMessage;
  } catch (err) {
    console.log("Error in editMessage:", err);
    return null;
  }
}

async function deleteFileFromBucket(file) {
  const s3 = new S3Client({
    region: "ru-central1",
    endpoint: "https://storage.yandexcloud.net/",
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.YA_ACCESS_KEY,
      secretAccessKey: process.env.YA_SECRET_KEY,
    },
  });
  // Derive correct S3 object key from file URL. Supports both storage and CDN URLs.
  let key = `uploads/${file?.name || ""}`;
  if (file && file.url) {
    try {
      const u = new URL(file.url);
      // "/krunpy-main/uploads/.." -> "uploads/..."; "/uploads/..." -> "uploads/..."
      key = u.pathname.replace(/^\/krunpy-main\//, "").replace(/^\//, "");
    } catch (e) {
      // fallback to name-based key
    }
  }
  const deleteObjectCommand = new DeleteObjectCommand({
    Bucket: "krunpy-main",
    Key: key,
  });
  const deletedObject = await s3.send(deleteObjectCommand);
  return deletedObject;
}

io.on("connection", async (socket) => {
  console.log(socket.id);
  socket.on("send-message", async (room, message, files = []) => {
    try {
      console.log(message);
      console.log(socket.handshake.headers.cookie);
      const newMessage = await createMessage(
        socket.handshake.headers.cookie,
        room,
        message,
        files
      );
      console.log(newMessage);
      if (newMessage) {
        if (!room) {
          io.emit("receive-message", newMessage);
        } else {
          console.log(`sending message to ${room}`);
          io.to(room).emit("receive-message", newMessage);
        }
      } else {
        socket.emit("error", { message: "Failed to create message" });
      }
    } catch (err) {
      console.log("Error in send-message:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("delete-message", async (room, message) => {
    try {
      console.log(message);
      console.log(socket.handshake.headers.cookie);
      const deletedMessage = await deleteMessage(
        socket.handshake.headers.cookie,
        room,
        message
      );
      console.log(deletedMessage);
      if (deletedMessage) {
        console.log(`deleted message from ${room}`);
        io.to(room).emit("deleted-message", deletedMessage);
      } else {
        socket.emit("error", { message: "Failed to delete message" });
      }
    } catch (err) {
      console.log("Error in delete-message:", err);
      socket.emit("error", { message: "Failed to delete message" });
    }
  });

  socket.on("edit-message", async (room, message, newText) => {
    try {
      console.log(`editing message`);
      const editedMessage = await editMessage(
        socket.handshake.headers.cookie,
        room,
        message,
        newText
      );
      console.log(editedMessage);
      if (editedMessage) {
        io.to(room).emit("edited-message", editedMessage);
      } else {
        socket.emit("error", { message: "Failed to edit message" });
      }
    } catch (err) {
      console.log("Error in edit-message:", err);
      socket.emit("error", { message: "Failed to edit message" });
    }
  });

  socket.on("join-room", (room) => {
    console.log(`joining room ${room}`);
    socket.join(room);
  });
});

instrument(io, { auth: false });

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

app.listen(process.env.PORT, () => {
  console.log(`server is running at http://localhost:${process.env.PORT}`);
});
