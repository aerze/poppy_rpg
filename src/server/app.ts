import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { MongoClient } from "mongodb";
// import twitchAuthMiddleware from "./auth";
import { Game } from "./game";

if (!process.env.MONGODB_URL) {
  throw Error("Failed to locate MongoURL");
}

const client = new MongoClient(process.env.MONGODB_URL);
export const game = new Game(client);
export const app = express();

// view engine setup
app.set("views", path.join(__dirname, "../../views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../../public")));
app.use(express.static(path.join(__dirname, "../../dist/builds")));

// app.use(twitchAuthMiddleware({
//   clientId: process.env.TWITCH_OAUTH_CLIENT_ID,
//   clientSecret: process.env.TWITCH_OAUTH_CLIENT_SECRET,
//   redirectUri: process.env.TWITCH_OAUTH_REDIRECT_URI,
// }));

// This is a test route to check the twitch authentication
// app.get('/', (req, res, next) => {
//   console.log('req.user', req.user);
//   res.send(`<h1>Logged in as ${req.user.username} with id ${req.user.userid}</h1>`);
// });

app.post("/heal-party", (request, response) => {
  game.handleReviveParty();
  response.send("ok");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: any, res: any, next: any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
