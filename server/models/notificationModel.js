const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipientUsername: {
    type: String,
    ref: "User",
    require: [true, "يجب أن يكون للإشعار مستلم"],
  },
  senderUsername: {
    type: String,
    ref: "User",
    require: [true, "يجب أن يكون للإشعار مرسل"],
  },
  returnUrl: {
    type: String,
    require: [true, "يجب أن يكون للإشعار رابط"],
  },
  message: {
    type: String,
    required: [true, "يجب أن يكون للإشعار رسالة"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  type: String,
  seen: { type: Boolean, default: false },
});

notificationSchema.index({ recipientUsername: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
