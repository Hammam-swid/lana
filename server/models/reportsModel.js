const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "يجب أن يكون للبلاغ مستخدم مبلغ"],
  },
  // قد يكون المبلغ عليه شخصاً أو منشوراً
  reportedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reportedComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post.comments",
  },
  reason: String,
  seen: Boolean,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
