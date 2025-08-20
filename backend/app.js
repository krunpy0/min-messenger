const express = require("express");
const expressWs = require("express-ws");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const prisma = require("./prisma");
require("dotenv").config();

const app = express();
expressWs(app);
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const mainRouter = require("./router/main");

app.use("/api", mainRouter);

app.listen(process.env.PORT, () => {
  console.log(`server is running at http://localhost:${process.env.PORT}`);
});
