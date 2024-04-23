const Post = require("../models/postModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.searchUserPosts = catchAsync(async (req, res, next) => {
  const { search, arSearch } = req.body;
  console.log(search);
  const users = await User.find({
    $or: [
      { fullName: { $regex: `.*${search}.*`, $options: "i" } },
      { username: { $regex: `.*${search}.*`, $options: "i" } },
    ],
    state: "active",
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
    .select("content user _id categories")
    .populate("user", "photo fullName username state");

  res.status(200).json({
    status: "success",
    result: users.length + posts.length,
    users,
    posts: posts.filter((post) => post.user.state === "active"),
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
    $nor: [
      { _id: { $in: req.user.blockedUsers } },
      { _id: { $in: req.user.blockerUsers } },
    ],
  }).select("username fullName photo verified");
  res.status(200).json({
    status: "success",
    result: users.length,
    users,
  });
});
