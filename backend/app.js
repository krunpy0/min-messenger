const express = require("express");
const expressWs = require("express-ws");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const prisma = require("./prisma");
require("dotenv").config();

const app = express();
expressWs(app);
const mainRouter = require("./router/main");

app.get("/", mainRouter);

app.listen(process.env.PORT, () => {
  console.log(`server is running at http://localhost:${process.env.PORT}`);
});
