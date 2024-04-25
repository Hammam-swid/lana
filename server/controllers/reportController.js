const catchAsync = require("../utils/catchAsync");
const Report = require("../models/reportsModel");

exports.createReport = catchAsync(async (req, res, next) => {
  const { reportedUser, reportedPost, reportedComment, reason, description } =
    req.body;
  const report = await Report.create({
    reporterId: req.user._id,
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
});
