const crypto = require("crypto");
const multer = require("multer");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");

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
  const user = await User.findByIdAndUpdate({
    fullName,
    photo,
    updatedAt: Date.now(),
  });
  res.status(200).json({
    status: "success",
    user,
  });
});

exports.deactivateMe = catchAsync(async (req, res, next) => {
  const verificationCode = crypto.randomInt(100000, 999999);
  req.user.verificationCode = verificationCode;
  req.user.verificationCodeEx = Date.now() + 5 * 60 * 1000;
  await req.user.save();
  await new Email(req.user).sendConfirmSignup();
  res.status(200).json({
    status: "success",
    message: "تم إرسال رسالة إلى البريد الإلكتروني",
  });
});

exports.completeDeactivateMe = catchAsync(async (req, res, next) => {
  const { verificationCode, password } = req.body;
  const user = await User.findOne({
    email: req.user.email,
    verificationCode,
    verificationCodeEx: { $gt: Date.now() },
  }).select("+password");
  if (!user) {
    return next(new AppError("رمز التحقق غير صحيح أو منتهي الصلاحية", 404));
  }
  console.log(user);
  if (!(await user.comparePassword(password, user.password))) {
    return next(new AppError("كلمة المرور غير صحيحة", 400));
  }
  user.state = "nonactive";
  user.verificationCode = undefined;
  user.verificationCodeEx = undefined;
  await user.save();
  res.status(200).json({
    status: "success",
  });
});
