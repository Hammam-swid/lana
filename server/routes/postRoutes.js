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
  deleteComment,
  updateComment,
  updatePost,
  likeComment,
  dislikeComment,
  cancelCommentReaction,
} = require("../controllers/postController");
const { protect, restrictTo } = require("../controllers/authController");

// إنشاء موجه فرعي خاص بالمناشير
const router = express.Router();

// router.use(protect)
//  استقبال طلب على المسار / ي
router
  .route("/")
  .get(protect, getPosts)
  .post(protect, restrictTo("user"), uploadPostImages, scanPost, createPost);

router
  .route("/:postId")
  .delete(protect, deletePost)
  .get(protect, getPost)
  .patch(protect, restrictTo("user"), uploadPostImages, scanPost, updatePost);

router.use(restrictTo("user"));
router.route("/:postId/like").patch(protect, likePost);
router.route("/:postId/dislike").patch(protect, dislikePost);
router.route("/:postId/cancelReaction").patch(protect, cancelReaction);

router.route("/:postId/comment").post(protect, commentOnPost);

router
  .route("/:postId/comment/:commentId")
  .delete(protect, deleteComment)
  .patch(protect, updateComment);

router.route("/comment/:commentId/like").post(protect, likeComment);
router.route("/comment/:commentId/dislike").post(protect, dislikeComment);
router
  .route("/comment/:commentId/cancelReaction")
  .delete(protect, cancelCommentReaction);

module.exports = router;
