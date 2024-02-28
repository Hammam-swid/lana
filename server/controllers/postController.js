const Post = require("../models/postModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const multer = require("multer");
const sharp = require("sharp");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPostImages = upload.fields([{ name: "images", maxCount: 4 }]);

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
  const { content } = req.body;
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
  let imagesCategories = [];
  if (req.files.images) {
    const bufferImages = req.files.images.map((file) => ({
      inlineData: {
        data: file.buffer.toString("base64"),
        mimeType: file.mimetype,
      },
    }));
    const visionModel = genAI.getGenerativeModel({
      model: "gemini-pro-vision",
    });
    console.log(bufferImages);
    const prompt = `what are the categories for this Images : in the response separate between the categories by ', '`;
    visionModel.safetySettings = safetySettings;
    const result = await visionModel.generateContent([prompt, ...bufferImages]);
    const response = await result.response;
    imagesCategories = response.text().split(", ");
    req.body.images = [];
    const imagesPromises = req.files.images.map(async (image, i) => {
      const filename = `posts-${req.user.id}-${Date.now()}-${i + 1}.${
        image.mimetype.split("/")[1]
      }`;
      await sharp(image.buffer).toFile(`public/assets/img/posts/${filename}`);
      req.body.images.push(filename);
    });
    await Promise.all(imagesPromises);
  }
  req.categories = [...textCategories, ...imagesCategories].map((category) =>
    category.trim()
  );
  next();
});

exports.createPost = catchAsync(async (req, res, next) => {
  const { content, images } = req.body;
  const user = {
    fullName: req.user.fullName,
    username: req.user.username,
    photo: req.user.photo,
  };
  const post = await Post.create({
    user,
    content,
    images,
    categories: req.categories,
  });

  res.status(201).json({
    status: "success",
    post,
  });
});
