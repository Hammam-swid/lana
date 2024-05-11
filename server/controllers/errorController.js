module.exports = (err, req, res, next) => {
  console.log(err.response);
  err.statusCode = err.statusCode || 500;
  res.status(err.statusCode).json({
    status: "fail",
    message: err.message,
    error: err,
  });
};
