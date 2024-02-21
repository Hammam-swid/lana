const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
  dateOfBirth: Date,
  verified: Boolean,
  followers: [
    {
      username: {
        type: String,
        unique: true,
        required: true,
      },
      fullName: {
        type: String,
        required: true,
      },
      photoUrl: {
        type: String,
        required: true,
      },
    },
  ],
  following: [
    {
      username: {
        type: String,
        unique: true,
        required: true,
      },
      fullName: {
        type: String,
        required: true,
      },
      photoUrl: {
        type: String,
        required: true,
      },
    },
  ],
  blockedUsers: [
    {
      username: {
        type: String,
        unique: true,
        required: true,
      },
      fullName: {
        type: String,
        required: true,
      },
      photoUrl: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified(this.password)) next();
    const newPassword = await bcrypt.hash(this.password, 12);
    this.password = newPassword;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (
  insertedPassword,
  userPassword
) {
  console.log(insertedPassword, userPassword);
  console.log(await bcrypt.compare(insertedPassword, userPassword));
  return await bcrypt.compare(insertedPassword, userPassword, (err) => {
    console.log(err);
  });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
