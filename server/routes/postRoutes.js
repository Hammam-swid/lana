const express = require("express");
const {
  getPosts,
  createPost,
  scanPost,
  uploadPostImages,
  likePost,
  dislikePost,
  cancelReaction,
} = require("../controllers/postController");
const { protect } = require("../controllers/authController");

// إنشاء موجه فرعي خاص بالمناشير
const router = express.Router();

const io = router.get("socket.io");
// router.use(protect)
//  استقبال طلب على المسار / ي
router
  .route("/")
  .get(protect, getPosts)
  .post(protect, uploadPostImages, scanPost, createPost);

// DELETE api.lana.com/api/v1/posts/38959jekof23982r2
// router.route("/:postId").get(getOnePost).patch(updatePost).delete(deletePost);

router.route("/:postId/like").patch(protect, likePost);
router.route("/:postId/dislike").patch(protect, dislikePost);
router.route("/:postId/cancelReaction").patch(protect, cancelReaction);

module.exports = router;
