var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const fs = require("fs");
const env = require("dotenv").config();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth");

const uaa = require("./middlewares/uaa");

var app = express();


const url = process.env.URL;

const MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(url, { useUnifiedTopology: true });

let connection;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", function (req, res, next) {
  const log = fs.createWriteStream(__dirname + "/access.log");
  log.write(req.method + req.url);
  next();
});
//database connection
app.use("/", (req, res, next) => {
  if (!connection) {
    // connect to database
    client.connect(function (err) {
      connection = client.db("project");
      req.db = connection;
      next();
    });
  } else {
    //
    req.db = connection;
    next();
  }
});
app.use(uaa.checkToken);

app.use("/", indexRouter);
app.use("/users", uaa.checkToken, usersRouter);
app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  //
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(3000, function () {
  console.log("It's running on port 3000");
});

module.exports = app;
