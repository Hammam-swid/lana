const crypto = require("crypto");
const multer = require("multer");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");
const Post = require("../models/postModel");
const sharp = require("sharp");
const Notification = require("../models/notificationModel");

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("لا يسمح برفع هذا النوع من الملفات", 400), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: multerFilter,
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const user = await User.findOne({ username, state: "active" });
  if (!user) {
    return next(new AppError("هذا المستخدم غير موجود", 404));
  }
  const posts = await Post.find({ user: user._id })
    .populate("user", "username photo fullName verified")
    .populate("comments.user", "username photo fullName state")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    user,
    posts: posts.map((post) => {
      post.comments = post.comments.filter(
        (comment) => comment.user.state === "active"
      );
      return post;
    }),
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

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.saveUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user._id}-${Date.now()}.${
    req.file.mimetype.split("/")[1]
  }`;
  await sharp(req.file.buffer).toFile(
    `public/assets/img/users/${req.file.filename}`
  );
  next();
});

exports.uploadUserPhoto = upload.single("photo");

exports.updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, "fullName", "gender", "dateOfBirth");
  filteredBody.updatedAt = Date.now();
  if (req.file) filteredBody.photo = req.file.filename;
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
  });
  // .populate("following", "fullName username photo verified state");
  // user.following = user.following.filter((follow) => follow.state === "active");
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
  const { verificationCode, password, email } = req.body;

  const user = await User.findOne({
    email,
    verificationCode,
    verificationCodeEx: { $gt: Date.now() },
  }).select("+password");
  if (!user) {
    return next(new AppError("رمز التحقق غير صحيح أو منتهي الصلاحية", 404));
  }
  console.log(req.body);
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
    req.user.following.some(
      (user) => user.toString() === followingUser._id.toString()
    )
  ) {
    return next(new AppError("هذا المستخدم متابَع بالفعل", 400));
  }
  req.user.following.push(followingUser._id);
  followingUser.followers.push(req.user._id);
  await req.user.save();
  await followingUser.save();
  // req.user = await req.user.populate(
  //   "following",
  //   "username fullName photo verified"
  // );
  res.status(201).json({
    status: "success",
    user: req.user,
  });
  const notification = await Notification.create({
    message: `لقد قام ${req.user.fullName} بمتابعة حسابك`,
    senderUsername: req.user.username,
    recipientUsername: followingUser.username,
    returnUrl: `/profile/${followingUser.username}`,
    type: "follow",
    createdAt: Date.now(),
  });
  const io = req.app.get("socket.io");
  const socketClients = req.app.get("socket-clients");
  io.to(
    ...socketClients
      .filter((client) => client.username === notification.recipientUsername)
      .map((client) => client.id)
  ).emit("notification", notification);
});

exports.unFollowUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const followingUser = await User.findById(userId);
  if (!followingUser) {
    return next(new AppError("هذا المستخدم غير موجود", 404));
  }
  if (
    !req.user.following.some(
      (user) => user.toString() === followingUser._id.toString()
    )
  ) {
    return next(new AppError("هذا المستخدم غير متابَع بالفعل", 400));
  }
  const newFollowers = req.user.following.filter(
    (user) => user.toString() !== followingUser._id.toString()
  );
  followingUser.followers = followingUser.followers.filter(
    (user) => user.toString() !== req.user._id.toString()
  );
  req.user.following = newFollowers;
  await req.user.save();
  await followingUser.save();
  // req.user = await req.user.populate(
  //   "following",
  //   "username fullName photo verified"
  // );
  res.status(200).json({
    status: "success",
    user: req.user,
  });
});

exports.getMyFollowings = catchAsync(async (req, res, next) => {
  const followingUsers = await User.find({
    _id: { $in: req.user.following },
    state: "active",
  }).select("username fullName photo verified");
  res.status(200).json({
    status: "success",
    result: followingUsers.length,
    followingUsers,
  });
});

exports.blockUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (req.user._id.toString() === userId) {
    return next(new AppError("لا يمكنك حظر نفسك", 400));
  }
  if (req.user.blockedUsers.some((user) => user._id.toString() === userId)) {
    return next(new AppError("هذا المستخدم محظور بالفعل", 400));
  }
  const toBlockUser = await User.findById(userId, { state: "active" });
  if (!toBlockUser) {
    return next(new AppError("هذا المستخدم غير موجود", 404));
  }
  console.log(req.user);
  if (!req.user.blockedUsers) req.user.blockedUsers = [];
  req.user.blockedUsers.push(toBlockUser._id);
  if (!toBlockUser.blockerUsers) toBlockUser.blockerUsers = [];
  toBlockUser.blockerUsers.push(req.user._id);
  await req.user.save();
  await toBlockUser.save();
  res.status(200).json({
    status: "success",
    user: req.user,
  });
});

exports.unBlockUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (req.user._id.toString() === userId) {
    return next(new AppError("لا يمكنك حظر نفسك من الأساس", 400));
  }
  if (!req.user.blockedUsers.some((user) => user._id.toString() === userId)) {
    return next(new AppError("هذا المستخدم غير محظور بالفعل", 400));
  }
  const toUnBlockUser = await User.findById(userId, { state: "active" });
  if (!toUnBlockUser) {
    return next(new AppError("هذا المستخدم غير موجود", 404));
  }
  req.user.blockedUsers = req.user.blockedUsers.filter(
    (user) => user.toString() !== userId
  );
  toUnBlockUser.blockerUsers = toUnBlockUser.blockerUsers.filter(
    (user) => user.toString() !== req.user._id.toString()
  );
  await req.user.save();
  await toUnBlockUser.save();
  res.status(200).json({
    status: "success",
    user: req.user,
  });
});

exports.banUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  await User.updateOne({ _id: userId }, { state: "banned" });
  res.status(204).json({
    status: "success",
  });
});
