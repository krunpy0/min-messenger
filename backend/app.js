const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("./passport");
const prisma = require("./db");
const jwt = require("jsonwebtoken");
const { instrument } = require("@socket.io/admin-ui");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const path = require("path");
const fs = require("fs");
const http = require("http");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const port = Number(process.env.PORT) || 3000;
const appOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOrigins = [...new Set([...appOrigins, "https://admin.socket.io"])];

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

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

const mainRouter = require("./router/main");

app.use("/api", mainRouter);

// Эндпоинт для получения файлов
const mediaDir = path.join(__dirname, "media");
// Создаем папку media, если её нет
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

app.get("/media/:filename", (req, res) => {
  const filename = req.params.filename;
  // Защита от path traversal атак
  const safeFilename = path.basename(filename);
  const filePath = path.join(mediaDir, safeFilename);

  // Проверяем существование файла
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  // Определяем MIME тип
  const mimeType = mime.lookup(filePath) || "application/octet-stream";
  res.setHeader("Content-Type", mimeType);
  
  // Отправляем файл
  res.sendFile(filePath);
});

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

const io = require("socket.io")(server, {
  cors: {
    origin: corsOrigins,
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
  try {
    let objectKey = null;
    if (file && file.url) {
      try {
        const url = new URL(file.url);
        const pathname = decodeURIComponent(url.pathname).replace(/^\/+/, "");

        if (S3_PUBLIC_BASE_URL && file.url.startsWith(S3_PUBLIC_BASE_URL)) {
          objectKey = pathname;
        } else if (url.pathname.startsWith("/media/")) {
          objectKey = path.basename(url.pathname);
        } else {
          objectKey = pathname;
        }
      } catch (e) {
        if (file.url.startsWith("/media/")) {
          objectKey = path.basename(file.url);
        } else {
          objectKey = file.url.replace(/^\/+/, "");
        }
      }
    }

    if (!objectKey) {
      console.log("Cannot determine object key for deletion");
      return;
    }

    if (file.url.startsWith("/media/")) {
      const safeFilename = path.basename(objectKey);
      const filePath = path.join(mediaDir, safeFilename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
      } else {
        console.log(`File not found: ${filePath}`);
      }
    } else {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: S3_BUCKET,
          Key: objectKey,
        })
      );
      console.log(`Deleted S3 object: ${objectKey}`);
    }
  } catch (err) {
    console.error("Error deleting file:", err);
  }
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

server.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});
