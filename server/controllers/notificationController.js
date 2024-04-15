const Notification = require("../models/notificationModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({
    recipientUsername: req.user.username,
  })
    .sort("-createdAt seen")
    .limit(50);
  res.status(200).json({
    status: "success",
    result: notifications.length,
    notifications,
  });
});

exports.seeNotification = catchAsync(async (req, res, next) => {
  const { notiId } = req.params;
  const noti = await Notification.findOneAndUpdate(
    { _id: notiId, recipientUsername: req.user.username },
    {
      seen: true,
    },
    {
      new: true,
    }
  );
  if (!noti) {
    next(new AppError("هذا الإشعار غير موجود", 404));
  }
  res.status(200).json({
    status: "success",
    notification: noti,
  });
});

exports.seeAllNotifications = catchAsync(async (req, res, next) => {
  const response = Notification.updateMany(
    {
      recipientUsername: req.user.username,
    },
    { seen: true }
  );
  res.status(200).json({
    status: "success",
    response,
  });
});
