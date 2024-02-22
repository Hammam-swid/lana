const Post = require("../models/postModel");
const catchAsync = require("../utils/catchAsync");
const { GoogleGenerativeAI } = require("@google/generative-ai");
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

exports.createPost = catchAsync(async (req, res, next) => {
  const { content, photos } = req.body;
  if (content) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    const visionModel = genAI.getGenerativeModel({
      model: "gemini-pro-vision",
    });
    const prompt = `what are the categories for this content: '${content}'`;
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    res.status(201).json({
      text,
    });
  }
});
