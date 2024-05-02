const mongoose = require("mongoose");

const verifyingRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "يجب أن يكون هناك مستخدم لطلب التوثيق"],
    unique: [true, "لا يمكنك إرسال أكثر من طلب توثيق في آن واحد"],
  },
  profileUrl: {
    type: String,
    required: [true, "يجب أن يكون هناك رابط لصفحة الحساب"],
  },
  image: {
    type: String,
    required: [true, "يجب إرسال صورة الوثيقة للتحقق منها"],
  },
});

const VerifyingRequest = mongoose.model(
  "VerifyingRequest",
  verifyingRequestSchema
);

module.exports = VerifyingRequest;
