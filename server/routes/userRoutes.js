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
  createModerator,
  logout,
  deleteAccountRequest,
  completeDeleteAccount,
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
  banUser,
  blockUser,
  unBlockUser,
  getMyBlockedUsers,
  isModerator,
  getAllUsers,
  activateUser,
  deactivateUser,
  unBanUser,
  isActive,
  getAllModerators,
  activateModerator,
  deactivateModerator,
  warnUser,
  getWarnings,
  setWarningSeen,
} = require("../controllers/userController");
const {
  uploadVerificationFile,
  createVerifyingRequest,
  saveVerificationFile,
  getAllVerifyingRequests,
} = require("../controllers/verificationRequestController");

const router = express.Router();

router.post("/signup", signup);
router.post("/verifySignup", verifySignup);
router.post("/login", login);
router.get("/logout", logout);

router.post("/forgotPassword", forgotPassword);
router.get("/tokenExist/:resetToken", isTokenExist);
router.patch("/resetPassword/:resetToken", resetPassword);
router.post("/checkUsername", checkUsernameExist);

router.use(protect);
router
  .route("/moderators")
  .get(restrictTo("admin"), getAllModerators)
  .post(restrictTo("admin"), createModerator);
router.get("/isActive", isActive);
router.get("/isModerator", isModerator);
router.patch("/updateMe", uploadUserPhoto, saveUserPhoto, updateMe);
router.get("/followingUsers", getMyFollowings);
router.get("/blockedUsers", getMyBlockedUsers);
router.post("/deactivateMe", deactivateMe);
router.patch("/completeDeactivateMe", completeDeactivateMe);
router.route("/warnings").get(getWarnings);
router
  .route("/verifyingRequest")
  .post(uploadVerificationFile, createVerifyingRequest)
  .get(restrictTo("admin", "moderator"), getAllVerifyingRequests);
router
  .route("/deleteAccount")
  .post(deleteAccountRequest)
  .delete(completeDeleteAccount);
router.route("/:username").get(getUser);

router.route("/warnings/:warningId").patch(restrictTo("user"), setWarningSeen);

router
  .route("/:userId/follow")
  .post(restrictTo("user"), followUser)
  .delete(restrictTo("user"), unFollowUser);
router
  .route("/:userId/block")
  .post(restrictTo("user"), blockUser)
  .delete(restrictTo("user"), unBlockUser);

router.route("/updateMyPassword").patch(updatePassword);

router
  .route("/:userId/activateModerator")
  .patch(restrictTo("admin"), activateModerator);
router
  .route("/:userId/deactivateModerator")
  .patch(restrictTo("admin"), deactivateModerator);

router.use(restrictTo("admin", "moderator"));
router.route("/:userId/ban").patch(banUser);
router.route("/:userId/warning").patch(warnUser);
router.route("/:userId/activate").patch(activateUser);
router.route("/:userId/deactivate").patch(deactivateUser);
router.route("/:userId/unBan").patch(unBanUser);
router.route("/").get(getAllUsers);
module.exports = router;
