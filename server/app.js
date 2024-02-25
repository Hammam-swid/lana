// استدعاء المكاتب الخارجية
const express = require("express");
const cors = require("cors");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// استدعاء الموجهات راوتر الخاصة بالمصادر
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
// import commentRouter from "./routes/commentRoutes";
// import reactionRouter from "./routes/reactionRoutes";
// import notificationRouter from "./routes/notificationRoutes";

// استخدام وسيط لتحويل جسم الطلب لصيغة =>
// => JSON
app.use(express.json({ limit: "10kb" }));
// استخدام وسيط لاستقبال الطلبات متعددة المصادر
app.use(cors());

app.use(express.static("public/assets/img"));

// توجيه الطلبات باتجاه الموجه الخاص بكل مصدر
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);
// app.use("/api/v1/comments", commentRouter);
// app.use("/api/v1/reactions", reactionRouter);
// app.use("/api/v1/notifications", notificationRouter);

app.all("*", (req, res) => {
  res.status(404).json({ status: "fail" });
});

app.use(globalErrorHandler);
module.exports = app;
