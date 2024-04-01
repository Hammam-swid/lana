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
    const posts = await Post.find()
      .sort("-createdAt")
      .limit(5)
      .populate("user", "username photo fullName state")
      .populate("comments.user", "username photo fullName state");

    res.status(200).json({
      status: "success",
      result: posts.length,
      posts: posts.filter((post) => post.user.state === "active"),
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
  const post = await Post.create({
    user: req.user._id,
    content,
    images,
    categories: req.categories,
  });

  res.status(201).json({
    status: "success",
    post: await post.populate("user", "username fullName photo"),
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findById(postId)
    .populate("user", "username photo fullName")
    .populate("comments.user", "username photo fullName state");
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
    req.user.id !== post.user.toString() &&
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
  let post = await Post.findById(postId);
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
      type: "like",
      username: req.user.username,
      createdAt: Date.now(),
    });
  }
  post = await (await post.save()).populate("user", "username fullName photo");
  res.status(201).json({
    status: "success",
    post,
  });
  if (post.user.username !== req.user.username) {
    const notification = await Notification.create({
      message: `قام ${req.user.fullName} بالإعجاب بمنشورك`,
      senderUsername: req.user.username,
      recipientUsername: post.user.username,
      returnUrl: `/post/${post.id}`,
      type: "like",
    });
    const io = req.app.get("socket.io");
    const socketClients = req.app.get("socket-clients");
    io.to(
      ...socketClients
        .filter((client) => client.username === notification.recipientUsername)
        .map((client) => client.id)
    ).emit("notification", notification);
  }
});

exports.dislikePost = catchAsync(async (req, res, next) => {
  console.log(req.app.get("socket.io"));
  const { postId } = req.params;
  let post = await Post.findById(postId);
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
      type: "dislike",
      username: req.user.username,
      createdAt: Date.now(),
    });
  }
  post = await (await post.save()).populate("user", "username fullName photo");
  res.status(201).json({
    status: "success",
    post,
  });
});

exports.cancelReaction = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  let post = await Post.findById(postId);
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
    post = await (
      await post.save()
    ).populate("user", "username fullName photo");
    return res.status(203).json({
      status: "success",
      post,
    });
  }
  next(new AppError("هذا المستخدم لم يتفاعل مع هذا المنشور", 404));
});

exports.commentOnPost = catchAsync(async (req, res, next) => {
  const { text } = req.body;
  const { postId } = req.params;
  const post = await Post.findOneAndUpdate(
    { _id: postId },
    {
      $push: { comments: { user: req.user._id, text, createdAt: Date.now() } },
    },
    { new: true }
  ).populate("comments.user", "username fullName photo state");

  if (!post) {
    return next(new AppError("هذا المنشور غير موجود", 404));
  }
  // await post.save();
  res.status(201).json({
    status: "success",
    comments: post.comments
      .filter((comment) => comment.user.state === "active")
      .sort((a, b) => a - b > 0),
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const { postId, commentId } = req.params;

  const post = await Post.findById(postId).populate(
    "comments.user",
    "username fullName photo state _id"
  );
  // { $pull: { comments: { _id: commentId, user: req.user._id } } },
  // { new: true }

  if (!post) {
    return next(new AppError("هذا المنشور غير موجود", 404));
  }
  const comment = post.comments.find(
    (comment) => comment._id.toString() === commentId
  );
  if (!comment) {
    return next(new AppError("هذا التعليق غير موجود من قبل", 404));
  }
  if (
    req.user.role !== "admin" &&
    req.user.role !== "supervisor" &&
    req.user._id.toString() !== post.user.toString() &&
    req.user._id.toString() !== comment.user._id.toString()
  ) {
    return next(new AppError("لا تملك الصلاحية لحذف هذا التعليق", 401));
  }
  post.comments.pull({ _id: commentId });
  await post.save();
  // console.log(commentId, post.comments[0].id);
  // if (post.comments.some((comment) => comment.id === commentId)) {
  //   return next(new AppError("لا تملك الصلاحيات لحذف هذا المنشور"));
  // }
  return res.status(204).json({ status: "success" });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const { commentId, postId } = req.params;
  const { text } = req.body;
  const post = await Post.findById(postId).populate(
    "comments.user",
    "username fullName photo state _id"
  );
  if (!post) {
    return next(new AppError("هذا المنشور غير موجود", 404));
  }
  const comment = post.comments.find(
    (comment) => comment._id.toString() === commentId
  );
  if (!comment) {
    return next(new AppError("هذا التعليق غير موجود", 404));
  }
  if (req.user.username !== comment.user.username) {
    return next(new AppError("لا تملك الصلاحيات لتعديل هذا التعليق", 401));
  }
  comment.text = text;
  post.comments = post.comments.map((oldComment) =>
    oldComment._id.toString() === commentId ? comment : oldComment
  );
  await post.save();
  res.status(200).json({
    status: "success",
    comments: post.comments,
  });
});
