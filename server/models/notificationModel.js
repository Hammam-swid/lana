const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
