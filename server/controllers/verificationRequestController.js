const multer = require("multer");
const catchAsync = require("../utils/catchAsync");
const VerifyingRequest = require("../models/verifyingRequestModel");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const sharp = require("sharp");
const Notification = require("../models/notificationModel");

const multerFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image") ||
    file.mimetype.split("/")[1] === "pdf"
  ) {
    cb(null, true);
  } else {
    cb(new AppError("لا يسمح برفع هذا النوع من الملفات", 400), false);
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/assets/verificationFiles",
    filename: (req, file, cb) => {
      req.filename = `user-${req.user._id}-${Date.now()}.${
        file.mimetype.split("/")[1]
      }`;
      cb(
        null,
        `user-${req.user._id}-${Date.now()}.${file.mimetype.split("/")[1]}`
      );
    },
  }),
  fileFilter: multerFilter,
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

exports.uploadVerificationFile = upload.single("verificationFile");

exports.saveVerificationFile = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  // console.log(req.file)
  req.file.filename = `user-${req.user._id}-${Date.now()}.${
    req.file.mimetype.split("/")[1]
  }`;
  await sharp(
    req.file.mimetype.startsWith("image") ? req.file.buffer : req.file
  ).toFile(`public/assets/verificationFiles/${req.file.filename}`);
  console.log(req.file.filename + " line 41");
  next();
});

exports.createVerifyingRequest = catchAsync(async (req, res, next) => {
  if (req.user.verified) {
    return next(new AppError("هذا المستخدم موثق بالفعل", 400));
  }
  const filteredBody = filterObj(req.body, "description");
  filteredBody.userId = req.user._id;
  filteredBody.profileUrl = `/profile/${req.user.username}`;
  filteredBody.createdAt = Date.now();
  if (req.file) filteredBody.verificationFile = req.file.filename;
  // console.log(filteredBody.verificationFile);
  await VerifyingRequest.create(filteredBody);
  res.status(201).json({
    status: "success",
    message: "تم إرسال طلب التوثيق، ستتم مراجعة طلب في أقرب وقت إن شاء الله.",
  });
});

exports.getAllVerifyingRequests = catchAsync(async (req, res, next) => {
  const verifyingRequests = await VerifyingRequest.find().sort(
    "seen -createdAt"
  );
  res.status(200).json({
    status: "success",
    result: verifyingRequests.length,
    verifyingRequests,
  });
});

exports.setVerifyingRequestSeen = catchAsync(async (req, res, next) => {
  const { verifyingRequestId } = req.params;
  const verifyingRequest = await VerifyingRequest.findByIdAndUpdate(
    verifyingRequestId,
    { seen: true },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    verifyingRequest,
  });
});

exports.acceptVerifyingRequest = catchAsync(async (req, res, next) => {
  const { verifyingRequestId } = req.params;
  const verifyingRequest = await VerifyingRequest.findById(verifyingRequestId);
  if (!verifyingRequest) {
    return next(new AppError("هذا الطلب غير موجود", 404));
  }
  const user = await User.findById(verifyingRequest.userId);
  if (!user) {
    return next(new AppError("هذا المستخدم غير موجود", 404));
  }
  user.verified = true;
  verifyingRequest.seen = true;
  await user.save();
  await verifyingRequest.save();
  console.log(verifyingRequest.profileUrl.split("/"));
  res.status(200).json({
    status: "success",
    message: "تم توثيق حساب هذا المستخدم بنجاح",
    verifyingRequest,
  });
  // إرسال إشعار للمستخدم الموثق حسابه
  const notification = await Notification.create({
    senderUsername: "moderators",
    recipientUsername: verifyingRequest.profileUrl.split("/profile/")[1],
    createdAt: Date.now(),
    returnUrl: verifyingRequest.profileUrl,
    type: "verifyingAccepted",
    message: "تم توثيق حسابك بنجاح",
  });

  const io = req.app.get("socket.io");
  const socketClients = req.app.get("socket-clients");
  io.to(
    ...socketClients
      .filter((client) => client.username === notification.recipientUsername)
      .map((client) => client.id)
  ).emit("notification", notification);
});

exports.rejectVerifyingRequest = catchAsync(async (req, res, next) => {
  // حذف الطلب من قاعدة البيانات
  /* 
    مع العلم أن الصور والملفات لن تمسح من الخادم
    ويمكن الوصول إليها عن طريق معرف المستخدم
  */
  const { verifyingRequestId } = req.params;
  const verifyingRequest = await VerifyingRequest.findByIdAndDelete(
    verifyingRequestId
  );
  res.status(200).json({
    status: "success",
    message: "تم رفض الطلب بنجاح",
  });
  // إرسال إشعار للمستخدم صاحب الطلب بأنه قد رفض
  const notification = await Notification.create({
    senderUsername: "moderators",
    recipientUsername: verifyingRequest.profileUrl.split("/profile/")[1],
    createdAt: Date.now(),
    returnUrl: verifyingRequest.profileUrl,
    type: "verifyingRejected",
    message: "تم رفض توثيق حسابك لعدم استيفائك للشروط المطلوبة",
  });

  const io = req.app.get("socket.io");
  const socketClients = req.app.get("socket-clients");
  io.to(
    ...socketClients
      .filter((client) => client.username === notification.recipientUsername)
      .map((client) => client.id)
  ).emit("notification", notification);
});
