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
  deactivateMe,
  completeDeactivateMe,
  followUser,
  unFollowUser,
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
router.post("/deactivateMe", deactivateMe);
router.patch("/completeDeactivateMe", completeDeactivateMe);
router.route("/:username").get(getUser);
router.route("/:userId/follow").post(followUser).delete(unFollowUser);

module.exports = router;
