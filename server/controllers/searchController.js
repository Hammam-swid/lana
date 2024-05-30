const Post = require("../models/postModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.searchUserPosts = catchAsync(async (req, res, next) => {
  const { search, arSearch } = req.body;
  console.log(search, arSearch);
  const users = await User.find({
    $or: [
      { fullName: { $regex: `.*${search}.*`, $options: "i" } },
      { fullName: { $regex: `.*${arSearch}.*`, $options: "i" } },
      { username: { $regex: `.*${search}.*`, $options: "i" } },
      { username: { $regex: `.*${arSearch}.*`, $options: "i" } },
    ],
    state: "active",
    role: "user",
    $nor: [
      { _id: { $in: req.user.blockedUsers } },
      { _id: { $in: req.user.blockerUsers } },
    ],
  }).select("username fullName photo verified");

  const posts = await Post.find({
    $or: [
      { content: { $regex: `.*${search}.*`, $options: "i" } },
      { categories: { $regex: `.*${search}.*`, $options: "i" } },
      { categories: { $regex: `.*${arSearch}.*`, $options: "i" } },
    ],
    $nor: [
      { user: { $in: req.user.blockedUsers } },
      { user: { $in: req.user.blockerUsers } },
    ],
  })
    .populate("user", "photo fullName username state verified")
    .populate("comments.user", "username photo fullName state verified _id")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    result: users.length + posts.length,
    users,
    posts: posts
      .filter((post) => post.user?.state === "active")
      .map((post) => {
        post.comments = post.comments.filter(
          (comment) =>
            comment.user?.state === "active" &&
            !req.user.blockedUsers
              .map((user) => user.toString())
              .includes(comment.user._id.toString()) &&
            !req.user.blockerUsers
              .map((user) => user.toString())
              .includes(comment.user._id.toString())
        );
        return post;
      }),
  });
});

exports.searchUser = catchAsync(async (req, res, next) => {
  const { search } = req.body;
  const users = await User.find({
    $or: [
      { fullName: { $regex: `.*${search}.*`, $options: "i" } },
      { username: { $regex: `.*${search}.*`, $options: "i" } },
    ],
    state: "active",
    role: "user",
    $nor: [
      { _id: { $in: req.user.blockedUsers } },
      { _id: { $in: req.user.blockerUsers } },
    ],
  })
    .select("username fullName photo verified")
    .limit(7)
    .sort("followers");
  res.status(200).json({
    status: "success",
    result: users.length,
    users,
  });
});
