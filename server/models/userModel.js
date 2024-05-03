const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const AppError = require("../utils/AppError");

const userSchema = new mongoose.Schema({
  fullName: {
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
  username: {
    type: String,
    required: [true, "المستخدم يجب أن يكون له اسم مستخدم"],
    trim: true,
    unique: [true, "اسم المستخدم هذا موجود"],
  },
  password: {
    type: String,
    required: [true, "يجب إدخال كلمة مرور"],
    minlength: [8, "كلمة السر يجب أن تحتوي على 8 أحرف على الأقل"],
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now(),
  },
  role: {
    type: String,
    enum: ["user", "moderator", "admin"],
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
    default: "nonactive",
    enum: ["active", "nonactive", "banned"],
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationCode: Number,
  verificationCodeEx: Date,
  resetPasswordToken: String,
  resetPasswordTokenExpires: Date,
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  blockedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  blockerUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  warnings: [
    {
      createdAt: Date,
      type: { type: String },
      reason: String,
      message: String,
      moderator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      seen: { type: Boolean, default: false },
    },
  ],
});

userSchema.pre("save", function (next) {
  const usernamePattern = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/;

  next();
});

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.post("save", function (doc) {
  const last3MonthsWarnings = doc.warnings.filter(
    (warning) =>
      new Date(warning.createdAt).getTime() >
      Date.now() - 3 * 30 * 24 * 60 * 60 * 1000
  ).length;
  if (last3MonthsWarnings >= 3) {
    doc.state = "banned";
    doc.save();
  }
});

userSchema.methods.comparePassword = async function (
  insertedPassword,
  userPassword
) {
  return await bcrypt.compare(insertedPassword, userPassword);
};

userSchema.methods.isPasswordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return passTimestamp > JWTTimestamp;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
