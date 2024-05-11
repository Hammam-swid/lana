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
  uploadVideo,
  scanVideos,
} = require("../controllers/postController");
const { protect, restrictTo } = require("../controllers/authController");

// إنشاء موجه فرعي خاص بالمناشير
const router = express.Router();

// router.use(protect)
//  استقبال طلب على المسار / ي
router.use(protect);
router
  .route("/")
  .get(getPosts)
  .post(restrictTo("user"), uploadPostImages, scanPost, createPost);

router.route("/video").post(uploadVideo, scanVideos);

router
  .route("/:postId")
  .delete(deletePost)
  .get(getPost)
  .patch(restrictTo("user"), uploadPostImages, scanPost, updatePost);

router
  .route("/:postId/comment/:commentId")
  .delete(deleteComment)
  .patch(restrictTo("user"), updateComment);

router.use(restrictTo("user"));
router.route("/:postId/like").patch(likePost);
router.route("/:postId/dislike").patch(dislikePost);
router.route("/:postId/cancelReaction").patch(cancelReaction);

router.route("/:postId/comment").post(commentOnPost);

router.route("/comment/:commentId/like").post(likeComment);
router.route("/comment/:commentId/dislike").post(dislikeComment);
router
  .route("/comment/:commentId/cancelReaction")
  .delete(cancelCommentReaction);

module.exports = router;
