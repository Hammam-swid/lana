const crypto = require("crypto");
const multer = require("multer");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");
const Post = require("../models/postModel");

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
  const { username } = req.params;
  const user = await User.findOne({ username, state: "active" });
  if (!user) {
    return next(new AppError("هذا المستخدم غير موجود", 404));
  }
  const posts = await Post.find({ user: user._id })
    .populate("user", "username photo fullName")
    .sort("-createdAt");
  res.status(200).json({
    status: "success",
    user,
    posts,
  });
});

exports.checkUsernameExist = catchAsync(async (req, res, next) => {
  const { username, email } = req.body;
  let user = await User.findOne({ username });
  if (user) {
    return next(new AppError("اسم المستخدم هذا موجود بالفعل", 400));
  }
  user = await User.findOne({ email });
  if (user) {
    return next(new AppError("لا يمكنك استخدام هذا البريد الالكتروني", 400));
  }
  res.status(200).json({
    status: "success",
    message: "يمكنك استخدام اسم المستخدم هذا في الوقت الحالي",
  });
});

exports.uploadUserPhoto = upload.single("photo");

exports.updateMe = catchAsync(async (req, res, next) => {
  const { fullName, photo, gender, dateOfBirth } = req.body;
  const user = await User.findByIdAndUpdate({
    fullName,
    photo,
    gender,
    dateOfBirth,
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

exports.followUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (userId === req.user._id) {
    return next(new AppError("لا يمكنك متابعة حسابك", 400));
  }
  const followingUser = await User.findById(userId);
  if (!followingUser) {
    return next(new AppError("هذا المستخدم غير موجود", 404));
  }
  if (
    req.user.following.find((user) => user.username === followingUser.username)
  ) {
    return next(new AppError("هذا المستخدم متابَع بالفعل", 400));
  }
  req.user.following.push({
    username: followingUser.username,
    fullName: followingUser.fullName,
    photo: followingUser.photo,
  });
  followingUser.followers.push({
    username: req.user.username,
    fullName: req.user.fullName,
    photo: req.user.photo,
  });
  await req.user.save();
  await followingUser.save();
  res.status(201).json({
    status: "success",
    message: "user followed",
    user: req.user,
  });
});

exports.unFollowUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const followingUser = await User.findById(userId);
  if (!followingUser) {
    return next(new AppError("هذا المستخدم غير موجود", 404));
  }
  if (
    !req.user.following.find((user) => user.username === followingUser.username)
  ) {
    return next(new AppError("هذا المستخدم غير متابَع بالفعل", 400));
  }
  const newFollowers = req.user.following.filter(
    (user) => user.username !== followingUser.username
  );
  followingUser.followers = followingUser.followers.filter(
    (user) => user.username !== req.user.username
  );
  const user = await User.findById(req.user._id);
  user.following = newFollowers;
  await user.save();
  await followingUser.save();
  res.status(200).json({
    status: "success",
    message: "user un followed",
    user,
  });
});
