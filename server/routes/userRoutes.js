const express = require("express");
const {
  signup,
  login,
  protect,
  verifySignup,
  forgotPassword,
  resetPassword,
  restrictTo,
  updatePassword,
  isTokenExist,
} = require("../controllers/authController");
const {
  getUser,
  uploadUserPhoto,
  updateMe,
  deactivateMe,
  completeDeactivateMe,
  followUser,
  unFollowUser,
  checkUsernameExist,
  saveUserPhoto,
  getMyFollowings,
} = require("../controllers/userController");

const router = express.Router();

router.post("/signup", signup);
router.post("/verifySignup", verifySignup);
router.post("/login", login);

router.post("/forgotPassword", forgotPassword);
router.get("/tokenExist/:resetToken", isTokenExist);
router.patch("/resetPassword/:resetToken", resetPassword);
router.post("/checkUsername", checkUsernameExist);

router.use(protect);
router.patch("/updateMe", uploadUserPhoto, saveUserPhoto, updateMe);
router.get("/followingUsers", getMyFollowings);
router.post("/deactivateMe", deactivateMe);
router.patch("/completeDeactivateMe", completeDeactivateMe);
router.route("/:username").get(getUser);
router.route("/:userId/follow").post(followUser).delete(unFollowUser);

router.route("/updateMyPassword").patch(updatePassword);

module.exports = router;
