const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const app = require("./app");

dotenv.config({
  path: "./config.env",
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
    origin: "http://localhost:5173",
  },
});

app.set('socket.io', io)

const DB = process.env.MONGO_URL.replace(
  "<PASSWORD>",
  process.env.MONGO_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    server.listen(process.env.PORT, process.env.HOST, () => {
      console.log(
        `the server is running on http://${process.env.HOST}:${process.env.PORT}`
      );
    });
  })
  .catch((err) => console.log(`connection error 💥 ${err}`));
