const express = require("express");
const {
  signup,
  login,
  protect,
  verifySignup,
} = require("../controllers/authController");
const { getUser } = require("../controllers/userController");
const Email = require("../utils/email");
const AppError = require("../utils/AppError");

const router = express.Router();

router.post("/signup", signup);
router.post("/verifySignup", verifySignup);

router.post("/login", login);

router.use(protect);
router.patch("/updateMe", async (req, res, next) => {
  try {
    const email = new Email({
      fullName: "Omar Gana",
      email: "gana000omar@gmail.com",
    });
    await email.sendConfirmSignup();
    res.status(200).json({
      message: "the email is sent",
    });
  } catch (error) {
    return new AppError(error.message, err.statusCode);
  }
});
router.route("/:userId").get(getUser);

module.exports = router;
