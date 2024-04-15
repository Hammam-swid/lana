const express = require("express");
const { protect } = require("../controllers/authController");
const {
  getMyNotifications,
  seeNotification,
  seeAllNotifications,
} = require("../controllers/notificationController");

const router = express.Router();

router.use(protect);

router.route("/").get(getMyNotifications).patch(seeAllNotifications);

router.route("/:notiId").patch(seeNotification);

module.exports = router;
