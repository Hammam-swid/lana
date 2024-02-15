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
  reactions: [
    {
      username: {
        type: String,
        unique: true,
        required: [true, "يجب أن يكون التفاعل تابعاً لمستخدم"],
      },
      type: {
        type: Number,
        required: true,
        enum: [-1, 1],
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  comments: [
    {
      user: {
        username: {
          type: String,
          required: [true, "يجب أن يكون التعليق تابعاً لمستخدم"],
        },
      },
      text: {
        type: String,
        required: [true, "يجب أن يحتوي التعليق على نص"],
      },
      reactions: [
        {
          username: {
            type: String,
            unique: true,
            required: [true, "يجب أن يكون التفاعل تابعاً لمستخدم"],
          },
          type: {
            type: Number,
            required: true,
            enum: [-1, 1],
          },
          createdAt: {
            type: Date,
            default: Date.now(),
          },
        },
      ],
    },
  ],
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
