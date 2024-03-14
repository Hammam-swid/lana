const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: {
    type: {
      fullName: String,
      username: String,
      photo: String,
    },
    required: [true, "يجب أن يكون للمنشور مستخدم ناشر"],
  },
  content: {
    type: String,
    required: true,
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: Date,
  categories: [String],
  reactions: [
    {
      username: {
        type: String,
        required: [true, "يجب أن يكون التفاعل تابعاً لمستخدم"],
      },
      type: {
        type: String,
        required: true,
        enum: ["like", "dislike"],
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
            required: [true, "يجب أن يكون التفاعل تابعاً لمستخدم"],
          },
          type: {
            type: String,
            required: true,
            enum: ["like", "dislike"],
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
