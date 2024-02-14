const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: {
    type: {
      name: String,
      userName: String,
      photo: String,
    },
    required: [true, "يجب أن يكون للمنشور مستخدم ناشر"],
  },
  content: String,
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
  ],
  dislikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "التعليق يجب أن يكون لمستخدم معين"],
      },
      text: {
        type: String,
        required: [true, "يجب أن يحتوي التعليق على نص"],
      },
      likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        unique: true,
      },
      dislikes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        unique: true,
      },
    },
  ],
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
