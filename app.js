// app.js

const express = require("express");
const app = express();
const PORT = 3017;
const cookieParser = require("cookie-parser");

const postRouter = require("./routes/posts.route.js");
const signupRouter = require("./routes/signup.js");
const loginRouter = require("./routes/login.js");

const { sequelize } = require("./models/index.js");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("assets"));
app.use("/api", [postRouter, signupRouter, loginRouter]);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
