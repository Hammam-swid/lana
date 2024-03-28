const express = require("express");
const {
  getPosts,
  createPost,
  scanPost,
  uploadPostImages,
  likePost,
  dislikePost,
  cancelReaction,
  deletePost,
  getPost,
  commentOnPost,
} = require("../controllers/postController");
const { protect, restrictTo } = require("../controllers/authController");

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
router.route("/:postId").delete(protect, deletePost).get(protect, getPost); //.patch(updatePost)

router.route("/:postId/like").patch(protect, likePost);
router.route("/:postId/dislike").patch(protect, dislikePost);
router.route("/:postId/cancelReaction").patch(protect, cancelReaction);

router
  .route("/:postId/comment")
  .post(protect, restrictTo("user"), commentOnPost);
// delete and update comment
// router.route("/:postId/comment").patch(protect, commentOnPost);
// router.route("/:postId/comment").patch(protect, commentOnPost);

module.exports = router;
