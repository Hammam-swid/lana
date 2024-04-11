const express = require("express");
const { protect } = require("../controllers/authController");
const { getMyNotifications } = require("../controllers/notificationController");

const router = express.Router();

router.use(protect);

router.route("/").get(getMyNotifications);

module.exports = router;
