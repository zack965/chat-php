var express = require("express");
var app = express();

var http = require("http").createServer(app);
var socketIO = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});
var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "send_socket_event_to_specific_users",
});

connection.connect(function (error) {
  console.log("Database connected: " + error);
});
var users = [];

socketIO.on("connection", function (socket) {
  socket.on("connected", function (userId) {
    users[userId] = socket.id;
  });

  // socket.on("sendEvent") goes here
  socket.on("sendEvent", async function (data) {
    connection.query(
      "SELECT * FROM users WHERE id = " + data.userId,
      function (error, receiver) {
        if (receiver != null) {
          if (receiver.length > 0) {
            connection.query(
              "SELECT * FROM users WHERE id = " + data.myId,
              function (error, sender) {
                if (sender.length > 0) {
                  console.log(users[receiver[0].id]);
                  var message =
                    "New message received from: " +
                    sender[0].name +
                    ". Message: " +
                    data.message;
                  socketIO
                    .to(users[receiver[0].id])
                    .emit("messageReceived", message);
                }
              }
            );
          }
        }
      }
    );
  });
});

http.listen(process.env.PORT || 3000, function () {
  console.log("Server is started.");
});
