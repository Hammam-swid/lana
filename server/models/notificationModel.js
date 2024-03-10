const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: [true, "يجب أن يكون للإشعار مستلم"],
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
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
  seen: Boolean,
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
