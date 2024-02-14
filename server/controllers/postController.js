const Post = require("../models/postModel");

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find();
    res.status(200).json({
      status: "success",
      result: posts.length,
      posts,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      data: null,
    });
  }
};
