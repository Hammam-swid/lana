const multer = require("multer");
const catchAsync = require("../utils/catchAsync");
const VerifyingRequest = require("../models/verifyingRequestModel");
const AppError = require("../utils/AppError");
const sharp = require("sharp");

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
