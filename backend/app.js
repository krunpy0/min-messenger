const express = require("express");
const expressWs = require("express-ws");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("./passport");
const prisma = require("./prisma");
//require("dotenv").config();
const io = require("socket.io")(8080, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

const app = express();
expressWs(app);
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

io.on("connection", (socket) => {
  console.log(socket.id);
});

io.on("send-message", (message) => {
  console.log(message);
});

app.listen(process.env.PORT, () => {
  console.log(`server is running at http://localhost:${process.env.PORT}`);
});
