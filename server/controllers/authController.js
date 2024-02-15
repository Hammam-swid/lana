const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  const token = createToken({ id: user._id });
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
    user,
  });
});
