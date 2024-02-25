const Post = require("../models/postModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
// const dotenv = require()

exports.getPosts = async (req, res, next) => {
  try {
    // const io = req.app.get('socket.io');
    // console.log(io)
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
  const { content, pictures } = req.body;
  if (!content) {
    return next(new AppError("يجب أن يحتوي المنشور على محتوى نصي", 400));
  }
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];
  textModel.safetySettings = safetySettings;
  const prompt = `what are the categories for this content: '${content}' : in the response separate between the categories by ', '`;
  const result = await textModel.generateContent(prompt);
  const response = await result.response;
  let textCategories = response.text();
  textCategories = textCategories.split(", ");
  req.textCategories = textCategories;
  if (pictures) {
    const visionModel = genAI.getGenerativeModel({
      model: "gemini-pro-vision",
    });
    const prompt = `what are the categories for this pictures : in the response separate between the categories by comma`;
    visionModel.safetySettings = safetySettings;
    const result = await visionModel.generateContent();
  }
  next();
});

exports.createPost = catchAsync(async (req, res, next) => {
  const { content, pictures } = req.body;
  const user = {
    fullName: req.user.fullName,
    username: req.user.username,
    photo: req.user.photo,
  };
  const post = await Post.create({
    user,
    content,
    pictures,
    categories: req.textCategories,
  });
  res.status(201).json({
    post,
  });
});
