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

app.set("socket-clients", []);

io.on("connection", (socket) => {
  socket.on("userLoggedIn", (user) => {
    const socketClients = app.get("socket-clients");
    socketClients.push({
      id: socket.id,
      username: user.username,
      role: user.role,
    });
    app.set("socket-clients", socketClients);
    console.log(socketClients);
  });
  socket.on("disconnect", () => {
    const socketClients = app.get("socket-clients");
    app.set(
      "socket-clients",
      socketClients.filter((client) => client.id !== socket.id)
    );
  });
});
app.set("socket.io", io);

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
