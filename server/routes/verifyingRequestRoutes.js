const express = require("express");
const {
  uploadVerificationFile,
  createVerifyingRequest,
  getAllVerifyingRequests,
  setVerifyingRequestSeen,
  acceptVerifyingRequest,
} = require("../controllers/verificationRequestController");
const { restrictTo, protect } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(uploadVerificationFile, createVerifyingRequest)
  .get(restrictTo("admin", "moderator"), getAllVerifyingRequests);

router.use(restrictTo("admin", "moderator"));

router.route("/:verifyingRequestId").patch(setVerifyingRequestSeen);
router.patch("/:verifyingRequestId/ok", acceptVerifyingRequest);
module.exports = router;
