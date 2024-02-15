const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
    minlength: [8, 'كلمة السر يجب أن تحتوي على 8 أحرف على الأقل'],
    select: false,
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

userSchema.pre("save", async function (next) {
  try {
    const newPassword = await bcrypt.hash(this.password, 12);
    console.log(newPassword, this.password);
    this.password = newPassword;
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
