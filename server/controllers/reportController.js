const catchAsync = require("../utils/catchAsync");
const Report = require("../models/reportsModel");
const AppError = require("../utils/AppError");
const Post = require("../models/postModel");
const Notification = require("../models/notificationModel");

exports.getReports = catchAsync(async (req, res, next) => {
  let reports = await Report.find()
    .populate("reportedUser", "username")
    .sort("seen reason");
  res.status(200).json({ status: "success", reports });
});

exports.createReport = catchAsync(async (req, res, next) => {
  const { reportedUser, reportedPost, reportedComment, reason, description } =
    req.body;
  if (!reportedComment && !reportedUser && !reportedPost) {
    return next(new AppError("يجب إرسال المبلغ عليه", 400));
  }
  const report = await Report.create({
    reporterUser: req.user._id,
    reportedComment,
    reportedPost,
    reportedUser,
    reason,
    description,
  });
  res.status(201).json({
    status: "success",
    report,
  });
  const notification = await Notification.create({
    recipientUsername: "moderators",
    senderUsername: req.user.username,
    createdAt: Date.now(),
    returnUrl: "/dashboard",
    type: "report",
    message: `لقد قام ${req.user.fullName} بالإبلاغ عن ${
      reportedPost
        ? "منشور"
        : reportedUser
        ? "مستخدم"
        : reportedComment
        ? "تعليق"
        : "شيء ما"
    }`,
  });
  const io = req.app.get("socket.io");
  const socketClients = req.app.get("socket-clients");

  io.to(
    ...socketClients
      .filter(
        (client) => client.role === "admin" || client.role === "moderator"
      )
      .map((client) => client.id)
  ).emit("notification", notification);
});

exports.deleteReport = catchAsync(async (req, res, next) => {
  const { reportId } = req.params;
  await Report.findByIdAndDelete(reportId);
  res.status(204).json({ status: "success" });
});

exports.getPostId = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  const post = await Post.findOne({ "comments._id": commentId }).select("_id");
  if (!post) {
    return next(new AppError("هذا المنشور غير موجود", 400));
  }
  res.status(200).json({ status: "success", postId: post._id });
});

exports.setReportSeen = catchAsync(async (req, res, next) => {
  const { reportId } = req.params;
  const report = await Report.findByIdAndUpdate(
    reportId,
    { seen: true },
    { new: true }
  );
  if (!report) {
    return next(new AppError("هذا التقرير غير موجود", 404));
  }
  res.status(200).json({
    status: "success",
    report,
  });
});
