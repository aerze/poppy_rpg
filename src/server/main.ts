#!/usr/bin/env node
require("dotenv").config();

import { Server } from "socket.io";
import { app } from "./app";
import { Claire } from "../rpg-server/claire";
import http from "http";
import { MongoClient } from "mongodb";

const port = normalizePort(process.env.PORT || "3000");

app.set("port", port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});
const mongo = new MongoClient(process.env.MONGODB_URL as string);

// game.io = io;
// io.on("connection", game.handleConnection);
Claire.initialize(io, server, mongo).then((claire: Claire) => {
  claire.http.listen(port);
  claire.http.on("error", onError);
  claire.http.on("listening", onListening);
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: any) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;

  for (const line of startupMessage.split("\n")) {
    console.log(line);
  }

  console.log("CLAIRE: Server listening on " + bind + " 🚀");
}

const startupMessage = `CLAIRE: Server Started 🦈`;
