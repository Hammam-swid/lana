// استدعاء المكاتب الخارجية
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const compression = require("compression");
const morgan = require("morgan");
const { default: rateLimit } = require("express-rate-limit");
const { default: helmet } = require("helmet");

const app = express();

const globalErrorHandler = require("./controllers/errorController");

// استدعاء الموجهات راوتر الخاصة بالمصادر
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
const searchRouter = require("./routes/searchRoutes");
const reportRouter = require("./routes/reportRoutes");
const verifyingRequestRouter = require("./routes/verifyingRequestRoutes");
const notificationRouter = require("./routes/notificationRoutes");

app.use(helmet({ crossOriginResourcePolicy: true }));

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// استخدام وسيط لتحويل جسم الطلب لصيغة =>
// => JSON
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
// استخدام وسيط لاستقبال الطلبات متعددة المصادر
app.use(cors());

app.use(express.static("public/assets/"));

app.use(mongoSanitize());

app.use(xss());
app.use(compression());

const limiter = rateLimit({
  max: 100,
  message: "to many requests from this IP",
});

// توجيه الطلبات باتجاه الموجه الخاص بكل مصدر
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/reports", reportRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/verifyingRequests", verifyingRequestRouter);

app.all("*", (req, res) => {
  res.status(404).json({ status: "fail", message: "هذا المسار غير موجود" });
});

app.use(globalErrorHandler);
module.exports = app;
