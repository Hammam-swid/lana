const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "المستخدم يجب أن يكون له اسم"],
    trim: true,
  },
  email: {
    type: String,
    unique: [true, "يجب أن يكون البريد الإلكتروني فريداً"],
    required: [true, "المستخدم يجب أن يكون له بريد إلكتروني"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "يجب إدخال كلمة مرور"],
  },
  role: {
    type: String,
    enum: ["user", "supervisor", "admin"],
    default: "user",
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: Date,
  state: {
    type: String,
    default: "active",
    enum: ["active", "nonactive", "banned"],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
