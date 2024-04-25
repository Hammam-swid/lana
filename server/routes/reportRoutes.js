const express = require("express");
const { protect } = require("../controllers/authController");
const { createReport } = require("../controllers/reportController");

const router = express.Router();

router.use(protect);
router.route("/").post(createReport);

module.exports = router;
