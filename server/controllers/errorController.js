const AppError = require("../utils/AppError");

const handleJWTError = () =>
  new AppError(
    "لم تقم بتسجيل الدخول، الرجاء تسجيل الدخول والمحاولة مرة أخرى",
    401
  );

const handleCastErrorDB = (err) => {
  const message = `قيمة ${err.path} التي أدخلتها غير صحيحة: ${err.value}`;
  return new AppError(message, 400);
};

const sendErrorProduction = (err, res) => {
  if (err.isOperational)
    return res.status(err.statusCode).json({
      status: "fail",
      message: err.message,
      error: err,
    });
  res.status(err.statusCode).json({
    status: "error",
    message: "حدث خطأ أثناء تنفيذ العملية",
    err,
  });
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `الحقل ${value} موجود من قبل، الرجاء إدخال قيمة أخرى`;
  return new AppError(message, 400);
};

const handleSafetyError = () =>
  new AppError("لا يمكن نشر هذا النوع من المحتوى على المنصة", 400);

module.exports = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  let error = { ...err, message: err.message };
  if (err.name === "CastError") error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError(err);
  if (err?.response?.candidates[0]?.finishReason === "SAFETY")
    error = handleSafetyError();
  sendErrorProduction(error, res);
};
