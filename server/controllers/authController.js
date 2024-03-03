const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Email = require("../utils/email");

const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { fullName, email, username, password } = req.body;
  const verificationCode = crypto.randomInt(0, 999999);
  const user = await User.create({
    fullName,
    email,
    password,
    username,
    verificationCode,
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
  const user = await User.findOne({ email, verificationCode });
  if (!user) {
    return next(new AppError("رمز التحقق غير صحيح", 400));
  }
  if (user.state === "banned") {
    return next(new AppError("هذا المستخدم تم حظره من استخدام المنصة", 403));
  }
  user.state = "active";
  user.verificationCode = undefined;
  await user.save();
  const token = createToken({ id: user._id });
  res.cookie("jwt", token, {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    secure: req.protocol === "https" ? true : undefined,
  });
  res.status(200).json({
    status: "success",
    token,
    user,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next(new AppError("الرجاء إدخال البريد الإلكتروني وكلمة المرور", 400));
  }
  const user = await User.findOne({ email, state: "active" }).select(
    "+password"
  );
  if (!user || !(await user.comparePassword(password, user.password))) {
    next(new AppError("البريد الإلكتروني أو كلمة المرور غير صحيحة", 404));
  }
  const token = createToken({ id: user._id });
  res.cookie("jwt", token, {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
  });
  user.password = undefined;
  res.status(200).json({
    status: "success",
    token,
    data: { user },
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
  const user = await User.findById(decode.id);
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
