const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("./passport");
const prisma = require("./prisma");
const { instrument } = require('@socket.io/admin-ui')
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
  },
});


const userIo = io.of('/user')
userIo.on('connection', socket => {
  console.log('Connected to userspace' + socket.username)
})

userIo.use((socket, next) => {
  if (socket.handshake.token) {
    socket.username = socket.handshake.token
    next()
  } else {
    next(new Error('No token'))
  }
})

io.on("connection", socket => {
  console.log(socket.id)
  socket.on('send-message', (room, message) => {
    console.log(message)
    if (!room) {
      socket.broadcast.emit('recieve-message', message)
    } else {
      console.log(room)
      socket.to(room).emit('recieve-message', message)
    }
  })
  socket.on('join-room', (room, cb) => {
    socket.join(room)
    cb("Joined room")
  })
})

instrument(io, {auth: false})

app.listen(process.env.PORT, () => {
  console.log(`server is running at http://localhost:${process.env.PORT}`);
});
