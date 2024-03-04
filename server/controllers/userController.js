const multer = require("multer");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("لا يسمح برفع هذا النوع من الملفات", 400), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage,
  fileFilter: multerFilter,
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findById(userId, { state: "active" });
  if (!user) {
    return next(new AppError("هذا المستخدم غير موجود", 404));
  }
  res.status(200).json({
    status: "success",
    user,
  });
});

exports.uploadUserPhoto = upload.single("photo");

exports.updateMe = catchAsync(async (req, res, next) => {
  const { fullName, photo } = req.body;
  photo = photo || "default.jpg";
  const user = await User.findByIdAndUpdate({ fullName, photo });
  res.status(200).json({
    status: 'success',
    user
  })
});
