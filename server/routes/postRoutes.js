const express = require( "express");
const { getPosts } = require("../controllers/postController");
const { protect } = require("../controllers/authController");


// إنشاء موجه فرعي خاص بالمناشير
const router = express.Router();

//  استقبال طلب على المسار / ي
router.route("/").get(protect, getPosts)//.post(createPost);

// DELETE api.lana.com/api/v1/posts/38959jekof23982r2
// router.route("/:postId").get(getOnePost).patch(updatePost).delete(deletePost);

module.exports = router;
