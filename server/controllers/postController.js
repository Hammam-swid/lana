const Post = require("../models/postModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmProbability,
  HarmBlockThreshold,
} = require("@google/generative-ai");
// const dotenv = require()

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find();
    res.status(200).json({
      status: "success",
      result: posts.length,
      posts,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      data: null,
    });
  }
};

exports.scanPost = catchAsync(async (req, res, next) => {
  const { content, photos } = req.body;
  if (!content) {
    return next(new AppError("يجب أن يحتوي المنشور على محتوى نصي", 400));
  }
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });
  textModel.safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
  ];
  const prompt = `what are the categories for this content: '${content}' : in the response separate between the categories by comma`;
  const result = await textModel.generateContent(prompt);
  const response = await result.response;
  let text = response.text();
  text = text.split(", ");
  if (photos) {
    const visionModel = genAI.getGenerativeModel({
      model: "gemini-pro-vision",
    });
  }
  res.status(201).json({
    categories: text,
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const { content, photos } = req.body;
  if (content) {
  }
});
