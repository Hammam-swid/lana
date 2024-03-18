const Post = require("../models/postModel");
const Notification = require("../models/notificationModel");
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
  // إنشاء اتصال مع نموذج ذكاء اصطناعي خاص بالتعامل مع النصوص
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });
  // تعديل خصائص الحماية
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
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
  // إرسال الأوامر للذكاء الاصطناعي
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
    // إنشاء اتصال مع نموذج ذكاء اصطناعي خاص بالتعامل مع الصور
    const visionModel = genAI.getGenerativeModel({
      model: "gemini-pro-vision",
    });
    // console.log(bufferImages);
    const prompt = `what are the categories for this Images : in the response separate between the categories by ', '`;
    visionModel.safetySettings = safetySettings;
    const result = await visionModel.generateContent([prompt, ...bufferImages]);
    const response = await result.response;
    imagesCategories = response.text().split(", ");
    // تخزين الصور في الطلب لتمريره للدالة التالية وتخزينها على الخادم أيضاً
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

exports.getPost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError("هذا المنشور غير موجود", 404));
  }
  res.status(200).json({
    status: "success",
    post,
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError("هذا المنشور غير موجود", 404));
  }
  if (
    req.user.username !== post.user.username &&
    req.user.role !== "admin" &&
    req.user.role !== "supervisor"
  ) {
    return next(new AppError("ليس لديك الصلاحية لحذف هذا المنشور", 403));
  }
  await Post.findByIdAndDelete(post._id);
  res.status(204).json({
    status: "success",
  });
});

exports.likePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError("هذا المنشور غير موجود", 404));
  }
  let reactionIndex;
  if (
    post.reactions.find((ele, index) => {
      if (ele.username === req.user.username) {
        reactionIndex = index;
        return true;
      }
      return false;
    })
  ) {
    if (post.reactions[reactionIndex].type === "dislike") {
      post.reactions[reactionIndex].type = "like";
    } else {
      return next(new AppError("لقد قمت بالإعجاب بهذا المنشور من قبل", 400));
    }
  } else {
    post.reactions.push({
      type: 'like',
      username: req.user.username,
      createdAt: Date.now(),
    });
  }
  await post.save();
  res.status(201).json({
    status: "success",
    post,
  });
  const notification = await Notification.create({
    message: `قام ${req.user.fullName} بالإعجاب بمنشورك`,
    senderUsername: req.user.username,
    recipientUsername: post.user.username,
    returnUrl: `http://localhost:5173/post/${post.id}`,
    type: "like",
  });
  const io = req.app.get("socket.io");
  const socketClients = req.app.get("socket-clients");
  io.to(
    ...socketClients
      .filter((client) => client.username === notification.recipientUsername)
      .map((client) => client.id)
  ).emit("notification", notification);
});

exports.dislikePost = catchAsync(async (req, res, next) => {
  console.log(req.app.get("socket.io"));
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError("هذا المنشور غير موجود", 404));
  }
  let reactionIndex;
  if (
    post.reactions.find((ele, index) => {
      if (ele.username === req.user.username) {
        reactionIndex = index;
        return true;
      }
      return false;
    })
  ) {
    if (post.reactions[reactionIndex].type === "like") {
      post.reactions[reactionIndex].type = "dislike";
    } else {
      return next(
        new AppError("لقد قمت بعدم الإعجاب بهذا المنشور من قبل", 400)
      );
    }
  } else {
    post.reactions.push({
      type: 'dislike',
      username: req.user.username,
      createdAt: Date.now(),
    });
  }
  await post.save();
  res.status(201).json({
    status: "success",
    post,
  });
});

exports.cancelReaction = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError("هذا المنشور غير موجود", 404));
  }
  let reactionIndex;
  if (
    post.reactions.find((ele, index) => {
      if (ele.username === req.user.username) {
        reactionIndex = index;
        return true;
      }
      return false;
    })
  ) {
    post.reactions.splice(reactionIndex, 1);
    await post.save();
    return res.status(203).json({
      status: "success",
      post
    });
  }
  next(new AppError("هذا المستخدم لم يتفاعل مع هذا المنشور", 404));
});
