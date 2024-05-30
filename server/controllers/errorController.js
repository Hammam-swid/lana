module.exports = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  if (err.isOperational)
    return res.status(err.statusCode).json({
      status: "fail",
      message: err.message,
      error: err,
    });
  res.status(err.statusCode).json({
    status: "error",
    message: "حدث خطأ أثناء تنفيذ العملية",
  });
};
