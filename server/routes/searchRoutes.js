const express = require("express");
const { protect } = require("../controllers/authController");
const {
  searchUserPosts,
  searchUser,
} = require("../controllers/searchController");

const router = express.Router();

router.use(protect);

router.post("/", searchUserPosts);
router.post("/suggest", searchUser);

module.exports = router;
