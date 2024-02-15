const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const app = require("./app");

dotenv.config({
  path: "./config.env",
});

const server = http.createServer(app);

exports.io = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
  },
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    server.listen(process.env.PORT, process.env.HOST, () => {
      console.log(
        `the server is running on http://${process.env.HOST}:${process.env.PORT}`
      );
    });
  })
  .catch((err) => console.log(`connection error 💥 ${err}`));
