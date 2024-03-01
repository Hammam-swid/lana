const express = require("express");
const { signup, login, protect } = require("../controllers/authController");
const { getUser } = require("../controllers/userController");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.use(protect);
router.route("/:userId", getUser);

module.exports = router;
