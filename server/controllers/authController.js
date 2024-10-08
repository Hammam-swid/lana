const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Email = require("../utils/email");
const Post = require("../models/postModel");

const createToken = (payload, role) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: role !== "user" ? "1d" : process.env.JWT_EXPIRES,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { fullName, email, username, password, gender, dateOfBirth } = req.body;
  const verificationCode = crypto.randomInt(100000, 999999);
  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    password,
    username,
    gender,
    dateOfBirth,
    createdAt: Date.now(),
    verificationCode,
    verificationCodeEx: Date.now() + 5 * 60 * 1000,
  });
  await new Email(user).sendConfirmSignup();
  res.status(201).json({
    status: "success",
    message: "تم إرسال رمز التحقق إلى البريد الإلكتروني",
    email,
  });
});

exports.verifySignup = catchAsync(async (req, res, next) => {
  const { email, verificationCode } = req.body;
  const user = await User.findOne({
    email: email.toLowerCase(),
    verificationCode,
    verificationCodeEx: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("رمز التحقق غير صحيح", 400));
  }
  if (user.state === "banned") {
    return next(new AppError("هذا المستخدم تم حظره من استخدام المنصة", 403));
  }
  user.state = "active";
  user.verificationCode = undefined;
  user.verificationCodeEx = undefined;
  await user.save();
  const token = createToken({ id: user._id }, user.role);
  res.cookie("jwt", token, {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    secure: req.protocol === "https" ? true : undefined,
  });
  user.password = undefined;
  res.status(200).json({
    status: "success",
    token,
    user,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new AppError("الرجاء إدخال البريد الإلكتروني وكلمة المرور", 400)
    );
  }
  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");
  if (!user) {
    return next(
      new AppError("البريد الإلكتروني أو كلمة المرور غير صحيحة", 404)
    );
  }

  if (user.state === "nonactive") {
    return next(new AppError("هذا الحساب غير مفعل", 403));
  } else if (user.state === "banned")
    return next(new AppError("هذا الحساب محظور من المنصة", 403));

  if (!(await user.comparePassword(password, user.password))) {
    return next(
      new AppError("البريد الإلكتروني أو كلمة المرور غير صحيحة", 404)
    );
  }
  const token = createToken({ id: user._id }, user.role);
  res.cookie("jwt", token, {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
  });
  user.password = undefined;
  // if (user.following) {
  //   await user.populate("following", "username fullName photo verified");
  //   user.following = user.following.filter(
  //     (follow) => follow.state === "active"
  //   );
  // }
  res.status(200).json({
    status: "success",
    token,
    data: { user },
  });
});

exports.logout = (req, res, next) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(Date.now() + 10000),
  });
  res.status(200).json({ status: "success" });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return next(new AppError("البريد الإلكتروني غير صحيح", 404));
  }
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.headers.origin}/reset-password/${resetToken}?email=${email}`;
  await new Email(user, resetURL).sendResetPassword();
  res.status(200).json({
    status: "success",
    message: "تم إرسال رسالة إلى البريد الإلكتروني",
  });
});

exports.deleteAccountRequest = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  const user = await User.findOne({
    email: req.user.email,
    state: "active",
  }).select("+password");
  if (!user) {
    return next(new AppError("هذا المستخدم غير موجود", 404));
  }
  if (!(await user.comparePassword(password, user.password))) {
    return next(new AppError("كلمة المرور غير صحيحة", 400));
  }
  const verificationCode = crypto.randomInt(100000, 999999);
  user.verificationCode = verificationCode;
  user.verificationCodeEx = Date.now() + 5 * 60 * 1000;
  await user.save();
  await new Email(user).sendConfirmDeactivate();
  res.status(200).json({
    status: "success",
    message: "تم إرسال رمز التحقق إلى بريد الإلكتروني",
  });
});

exports.completeDeleteAccount = catchAsync(async (req, res, next) => {
  const { verificationCode } = req.body;
  const user = await User.findOne({
    email: req.user.email,
    verificationCode,
    verificationCodeEx: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("هذا المستخدم غير موجود", 404));
  }
  const postsResult = await Post.deleteMany({ user: req.user._id });
  console.log(postsResult);
  const userResult = await User.deleteOne({ _id: user._id });
  console.log(userResult);
  res.status(200).json({
    status: "success",
    message: "تم حذف الحساب بنجاح",
  });
});

exports.isTokenExist = catchAsync(async (req, res, next) => {
  const { resetToken } = req.params;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new AppError("الرمز الذي أرسلته غير صحيح أو منتهي الصلاحية", 404)
    );
  }
  res.status(200).json({
    status: "success",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const { resetToken } = req.params;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    email: email.toLowerCase(),
    resetPasswordToken: hashedToken,
    resetPasswordTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new AppError("الرمز الذي أرسلته غير صحيح أو منتهي الصلاحية", 404)
    );
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpires = undefined;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "تم تغيير كلمة السر بنجاح",
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError(
        "لم تقم بتسجيل الدخول. الرجاء تسجيل الدخول والمحاولة مرة أخرى",
        401
      )
    );
  }

  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findOne({ _id: decode.id, state: "active" });
  if (!user) {
    return next(new AppError("هذا المستخدم غير موجود", 401));
  }

  if (user.isPasswordChangedAfter(decode.iat)) {
    return next(
      new AppError(
        "لقد قمت بتغيير كلمة المرور مؤخراً. الرجاء تسجيل الدخول مرة أخرى",
        401
      )
    );
  }
  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("ليست لديك الصلاحيات لتنفيذ هذه الوظيفة", 403));
    }
    next();
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
    return next(new AppError("كلمة المرور الحالية غير صحيحة", 400));
  }
  user.password = req.body.password;
  await user.save();
  const token = createToken({ id: user._id }, user.role);
  user.password = undefined;
  // if (user.following) {
  //   await user.populate("following", "username fullName photo verified state");
  //   user.following = user.following.filter(
  //     (follow) => follow.state === "active"
  //   );
  // }
  res.status(201).json({
    status: "success",
    token,
    user,
  });
});

exports.createModerator = catchAsync(async (req, res, next) => {
  const { email, username, password, fullName, role } = req.body;
  const moderator = await User.create({
    email,
    username,
    password,
    fullName,
    role,
  });
  res.status(201).json({ status: "success", moderator });
});
