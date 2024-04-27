const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  createReport,
  getReports,
  deleteReport,
  getPostId,
  setReportSeen,
} = require("../controllers/reportController");

const router = express.Router();

router.use(protect);
router
  .route("/")
  .post(createReport)
  .get(restrictTo("admin", "moderator"), getReports);

router.use(restrictTo("admin", "moderator"));

router.route("/:reportId").delete(deleteReport).patch(setReportSeen);
router.route("/:commentId/post").get(getPostId);
module.exports = router;
