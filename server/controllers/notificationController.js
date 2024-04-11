const Notification = require("../models/notificationModel");
const catchAsync = require("../utils/catchAsync");

exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({
    recipientUsername: req.user.username,
  });
  res.status(200).json({
    status: "success",
    result: notifications.length,
    notifications,
  });
});
