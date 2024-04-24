const Post = require("../models/postModel");
const Notification = require("../models/notificationModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const aws = require("aws-sdk");
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
    const posts = await Post.find({
      $nor: [
        { user: { $in: req.user.blockedUsers } },
        { user: { $in: req.user.blockerUsers } },
      ],
    })
      .sort("-createdAt")
      // .limit(5)
      .populate("user", "username photo fullName state verified _id")
      .populate("comments.user", "username photo fullName state verified _id");
    // .populate({
    //   path: "comments",
    //   match: {
    //     user: {
    //       state: "active",
    //       $nor: [
    //         { id: req.user.blockedUsers },
    //         { id: req.user.blockerUsers },
    //       ],
    //     },
    //   },
    // })
    console.log(req.user.blockedUsers);
    // posts.filter(
    //   (post) =>
    //     !req.user.blockedUsers
    //       .map((user) => user.toString())
    //       .includes(post.user._id.toString())
    // );
    res.status(200).json({
      status: "success",
      result: posts.length,
      posts: posts
        .filter((post) => post.user.state === "active")
        .map((post) => {
          post.comments = post.comments.filter(
            (comment) =>
              comment.user.state === "active" &&
              !req.user.blockedUsers
                .map((user) => user.toString())
                .includes(comment.user._id.toString()) &&
              !req.user.blockerUsers
                .map((user) => user.toString())
                .includes(comment.user._id.toString())
          );
          return post;
        }),
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
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  console.log(req.body);
  if (req.method.toUpperCase() === "POST")
    if (!content) {
      return next(new AppError("يجب أن يحتوي المنشور على محتوى نصي", 400));
    }
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
  let textCategories = [];
  if (content) {
    // إنشاء اتصال مع نموذج ذكاء اصطناعي خاص بالتعامل مع النصوص
    const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    // تعديل خصائص الحماية

    textModel.safetySettings = safetySettings;
    // إرسال الأوامر للذكاء الاصطناعي
    const prompt = `what are the categories for this content: '${content}' : in the response separate between the categories by ', '`;
    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    textCategories = response.text();
    textCategories = textCategories.split(", ");
  }
  let imagesCategories = [];
  if (req.files && req.files.images) {
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
    createdAt: Date.now(),
    categories: req.categories,
  });

  res.status(201).json({
    status: "success",
    post: await post.populate("user", "username fullName photo verified"),
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  // console.log(req.body);
  let post = await Post.findById(postId);
  if (!post) {
    return next(new AppError("هذ المنشور غير موجود", 404));
  }
  if (post.user.toString() !== req.user._id.toString()) {
    return next(new AppError("لا تملك الصلاحيات للعديل على هذا المنشور", 401));
  }
  post = await Post.findByIdAndUpdate(
    postId,
    { ...req.body, updatedAt: Date.now() },
    { new: true }
  )
    .populate("user", "username fullName photo verified")
    .populate("comments.user", "username fullName photo state");
  post.comments = post.comments.filter(
    (comment) =>
      comment.user.state === "active" &&
      !req.user.blockedUsers
        .map((user) => user.toString())
        .includes(comment.user._id.toString()) &&
      !req.user.blockerUsers
        .map((user) => user.toString())
        .includes(comment.user._id.toString())
  );
  res.status(200).json({
    status: "success",
    post,
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findOne({
    _id: postId,
    $nor: [
      { user: { $in: req.user.blockedUsers } },
      { user: { $in: req.user.blockerUsers } },
    ],
  })
    .populate("user", "username photo fullName verified")
    .populate("comments.user", "username photo fullName state");
  if (!post) {
    return next(new AppError("هذا المنشور غير موجود", 404));
  }
  post.comments = post.comments.filter(
    (comment) =>
      comment.user.state === "active" &&
      !req.user.blockedUsers
        .map((user) => user.toString())
        .includes(comment.user._id.toString()) &&
      !req.user.blockerUsers
        .map((user) => user.toString())
        .includes(comment.user._id.toString())
  );
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
  if (post.user.username !== req.user.username) {
    const notification = await Notification.create({
      message: `قام أحد المشرفين بحذف منشورك`,
      senderUsername: req.user.username,
      recipientUsername: post.user.username,
      returnUrl: `/post/${post.id}`,
      type: "deletePost",
      createdAt: Date.now(),
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

exports.likePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  let post = await Post.findById(postId).populate(
    "comments.user",
    "username fullName state photo"
  );
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
      post.reactions[reactionIndex].createdAt = Date.now();
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
  await post.save();
  post = await post.populate("user", "username fullName photo verified");
  post.comments = post.comments.filter(
    (comment) =>
      comment.user.state === "active" &&
      !req.user.blockedUsers
        .map((user) => user.toString())
        .includes(comment.user._id.toString()) &&
      !req.user.blockerUsers
        .map((user) => user.toString())
        .includes(comment.user._id.toString())
  );
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
      createdAt: Date.now(),
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
  // console.log(req.app.get("socket.io"));
  const { postId } = req.params;
  let post = await Post.findById(postId).populate(
    "comments.user",
    "username fullName state photo"
  );
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
      post.reactions[reactionIndex].createdAt = Date.now();
    } else {
      return next(
        new AppError("لقد قمت بعدم الإعجاب بهذا المنشور من قبل", 400)
      );
    }
  } else {
    post.reactions.push({
      type: "dislike",
      username: req.user.username,
    });
  }
  post = await (
    await post.save()
  ).populate("user", "username fullName photo verified");

  post.comments = post.comments.filter(
    (comment) =>
      comment.user.state === "active" &&
      !req.user.blockedUsers
        .map((user) => user.toString())
        .includes(comment.user._id.toString()) &&
      !req.user.blockerUsers
        .map((user) => user.toString())
        .includes(comment.user._id.toString())
  );
  res.status(201).json({
    status: "success",
    post,
  });
  if (post.user.username !== req.user.username) {
    const notification = await Notification.create({
      message: `لم يعجب ${req.user.fullName} بمنشورك`,
      senderUsername: req.user.username,
      recipientUsername: post.user.username,
      returnUrl: `/post/${post.id}`,
      type: "dislike",
      createdAt: Date.now(),
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

exports.cancelReaction = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  let post = await Post.findById(postId).populate(
    "comments.user",
    "fullName username photo state"
  );
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
    post = await post.populate("user", "username fullName photo verified");
    post.comments = post.comments.filter(
      (comment) =>
        comment.user.state === "active" &&
        !req.user.blockedUsers
          .map((user) => user.toString())
          .includes(comment.user._id.toString()) &&
        !req.user.blockerUsers
          .map((user) => user.toString())
          .includes(comment.user._id.toString())
    );
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
  )
    .populate("user", "username fullName photo verified")
    .populate("comments.user", "username fullName photo state");

  if (!post) {
    return next(new AppError("هذا المنشور غير موجود", 404));
  }
  // await post.save();
  res.status(201).json({
    status: "success",
    comments: post.comments
      .filter(
        (comment) =>
          comment.user.state === "active" &&
          !req.user.blockedUsers
            .map((user) => user.toString())
            .includes(comment.user._id.toString()) &&
          !req.user.blockerUsers
            .map((user) => user.toString())
            .includes(comment.user._id.toString())
      )
      .sort((a, b) => a - b > 0),
  });
  if (post.user.username !== req.user.username) {
    const notification = await Notification.create({
      message: `قام ${req.user.fullName} بالتعليق على منشورك`,
      senderUsername: req.user.username,
      recipientUsername: post.user.username,
      returnUrl: `/post/${post.id}`,
      type: "comment",
      createdAt: Date.now(),
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

exports.deleteComment = catchAsync(async (req, res, next) => {
  const { postId, commentId } = req.params;

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
  res.status(204).json({ status: "success" });
  if (comment.user.username !== req.user.username) {
    const notification = await Notification.create({
      message: `قام ${
        req.user.role === "user" ? req.user.fullName : "أحد المشرفين"
      } بحذف تعليقك`,
      senderUsername: req.user.username,
      recipientUsername: comment.user.username,
      returnUrl: `/post/${post.id}`,
      type: "deleteComment",
      createdAt: Date.now(),
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
  comment.updatedAt = Date.now();
  post.comments = post.comments.map((oldComment) =>
    oldComment._id.toString() === commentId ? comment : oldComment
  );
  await post.save();
  res.status(200).json({
    status: "success",
    comments: post.comments.filter(
      (comment) =>
        comment.user.state === "active" &&
        !req.user.blockedUsers
          .map((user) => user.toString())
          .includes(comment.user._id.toString()) &&
        !req.user.blockerUsers
          .map((user) => user.toString())
          .includes(comment.user._id.toString())
    ),
  });
});

exports.likeComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const post = await Post.findOne({
    "comments._id": commentId,
    $nor: [
      { user: { $in: req.user.blockedUsers } },
      { user: { $in: req.user.blockerUsers } },
    ],
  })
    .populate("user", "username fullName state photo verified")
    .populate("comments.user", "username fullName state photo verified");
  if (!post) {
    return next(new AppError("هذا التعليق غير موجود", 404));
  }
  if (post.user.state !== "active") {
    return next(new AppError("هذا المستخدم غير موجود", 404));
  }
  const comment = post.comments.find(
    (comment) => comment._id.toString() === commentId
  );
  let i;
  if (
    comment.reactions.some((react, index) => {
      if (react.username === req.user.username) {
        i = index;
        return true;
      }
      return false;
    })
  ) {
    if (comment.reactions[i].type === "dislike") {
      comment.reactions[i].type = "like";
      comment.reactions[i].createdAt = Date.now();
    } else {
      return next(new AppError("لقد قمت بالإعجاب بهذا التعليق من قبل", 400));
    }
  } else {
    comment.reactions.push({
      type: "like",
      username: req.user.username,
      createdAt: Date.now(),
    });
  }
  await post.save();
  post.comments = post.comments.filter(
    (comment) =>
      comment.user.state === "active" &&
      !req.user.blockedUsers.includes(comment.user._id.toString()) &&
      !req.user.blockerUsers.includes(comment.user._id.toString())
  );
  res.status(201).json({
    status: "success",
    comments: post.comments,
    returnUrl: `/post/${post.id}?commentId=${commentId}`,
  });
  if (comment.user.username !== req.user.username) {
    const notification = await Notification.create({
      message: `قام ${req.user.fullName} بالإعجاب بتعليقك`,
      senderUsername: req.user.username,
      recipientUsername: comment.user.username,
      returnUrl: `/post/${post.id}?commentId=${commentId}`,
      type: "like",
      createdAt: Date.now(),
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

exports.dislikeComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const post = await Post.findOne({
    "comments._id": commentId,
    $nor: [
      { user: { $in: req.user.blockedUsers } },
      { user: { $in: req.user.blockerUsers } },
    ],
  })
    .populate("user", "username fullName state photo verified")
    .populate("comments.user", "username fullName state photo verified");
  if (!post) {
    return next(new AppError("هذا التعليق غير موجود", 404));
  }
  if (post.user.state !== "active") {
    return next(new AppError("هذا المستخدم غير موجود", 404));
  }
  const comment = post.comments.find(
    (comment) => comment._id.toString() === commentId
  );
  let i;
  if (
    comment.reactions.some((react, index) => {
      if (react.username === req.user.username) {
        i = index;
        return true;
      }
      return false;
    })
  ) {
    if (comment.reactions[i].type === "like") {
      comment.reactions[i].type = "dislike";
      comment.reactions[i].createdAt = Date.now();
    } else {
      return next(new AppError("لم تعجب بهذا التعليق من قبل", 400));
    }
  } else {
    comment.reactions.push({
      type: "dislike",
      username: req.user.username,
      createdAt: Date.now(),
    });
  }
  await post.save();
  post.comments = post.comments.filter(
    (comment) =>
      comment.user.state === "active" &&
      !req.user.blockedUsers.includes(comment.user._id.toString()) &&
      !req.user.blockerUsers.includes(comment.user._id.toString())
  );
  res.status(201).json({ status: "success", comments: post.comments });
  if (comment.user.username !== req.user.username) {
    const notification = await Notification.create({
      message: `لم يعجب ${req.user.fullName} بتعليقك`,
      senderUsername: req.user.username,
      recipientUsername: comment.user.username,
      returnUrl: `/post/${post.id}?commentId=${commentId}`,
      type: "dislike",
      createdAt: Date.now(),
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

exports.cancelCommentReaction = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const post = await Post.findOne({
    "comments._id": commentId,
    $nor: [
      { user: { $in: req.user.blockedUsers } },
      { user: { $in: req.user.blockerUsers } },
    ],
  })
    .populate("user", "username fullName state photo verified")
    .populate("comments.user", "username fullName state photo verified");
  if (!post) {
    return next(new AppError("هذا التعليق غير موجود", 404));
  }
  if (post.user.state !== "active") {
    return next(new AppError("هذا المستخدم غير موجود", 404));
  }
  const comment = post.comments.find(
    (comment) => comment._id.toString() === commentId
  );
  let i;
  if (
    comment.reactions.some((react, index) => {
      if (react.username === req.user.username) {
        i = index;
        return true;
      }
      return false;
    })
  ) {
    comment.reactions.splice(i, 1);
    await post.save();
    post.comments = post.comments.filter(
      (comment) =>
        comment.user.state === "active" &&
        !req.user.blockedUsers.includes(comment.user._id.toString()) &&
        !req.user.blockerUsers.includes(comment.user._id.toString())
    );
    return res.status(200).json({
      status: "success",
      comments: post.comments,
      message: "تم إلغاء التفاعل",
    });
  }
  next(new AppError("لم تتفاعل مع هذا التعليق بالفعل", 400));
});

// exports.scanImageVideos = catchAsync((async) => (req, res, next) => {});

// aws.config.update({
//   accessKeyId: ''
// })
// const rek = new aws.Rekognition();

// console.log(rek.config.params)

// // rek.detectModerationLabels((error, data) => {
// //   console.log(error, data);
// // });
