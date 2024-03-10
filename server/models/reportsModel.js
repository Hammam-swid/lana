const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'يجب أن يكون للبلاغ مستخدم مبلغ']
  },
  // قد يكون المبلغ عليه شخصاً أو منشوراً
  reportedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  type: String,
  seen: Boolean,
  reason: String,
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
