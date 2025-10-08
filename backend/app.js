const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("./passport");
const prisma = require("./prisma");
const jwt = require("jsonwebtoken");
const { instrument } = require("@socket.io/admin-ui");
const mime = require("mime-types");
//require("dotenv").config();

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
  console.log(`deleting message ${message}`);
  const cookies = Object.fromEntries(
    cookieHeader?.split("; ").map((c) => c.split("="))
  );
  const token = cookies?.token; // если твой токен в cookie называется 'token'
  if (!token) throw new Error("No token provided");
  const deletedMessage = await prisma.message.update({
    where: { id: message, chatId: chatId },
    data: { deleted: true },
  });
  return deletedMessage;
}

io.on("connection", async (socket) => {
  console.log(socket.id);
  socket.on("send-message", async (room, message, files = []) => {
    console.log(message);
    console.log(socket.handshake.headers.cookie);
    const newMessage = await createMessage(
      socket.handshake.headers.cookie,
      room,
      message,
      files
    );
    console.log(newMessage);
    if (!room) {
      io.emit("receive-message", newMessage);
    } else {
      console.log(`sending message to ${room}`);
      io.to(room).emit("receive-message", newMessage);
    }
  });

  socket.on("join-room", (room) => {
    console.log(`joining room ${room}`);
    socket.join(room);
  });
});

instrument(io, { auth: false });

app.listen(process.env.PORT, () => {
  console.log(`server is running at http://localhost:${process.env.PORT}`);
});
