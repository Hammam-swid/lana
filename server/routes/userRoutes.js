const express = require("express");
const {
  signup,
  login,
  protect,
  verifySignup,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const {
  getUser,
  uploadUserPhoto,
  updateMe,
} = require("../controllers/userController");
const Email = require("../utils/email");
const AppError = require("../utils/AppError");

const router = express.Router();

router.post("/signup", signup);
router.post("/verifySignup", verifySignup);
router.post("/login", login);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:resetToken", resetPassword);

router.use(protect);
router.patch("/updateMe", uploadUserPhoto, updateMe);
router.route("/:userId").get(getUser);

module.exports = router;
