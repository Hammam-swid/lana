/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";
import PostImages from "./PostImages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  faThumbsUp,
  faThumbsDown,
  faMessage,
  faShare,
  faTrash,
  faFlag,
  faPen,
  faEarthAfrica,
  faEllipsisH,
  faXmark,
  faPaperPlane,
  faCircleNotch,
  faImage,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Comments from "./Comments";
import { useFormik } from "formik";
import * as Yup from "yup";
import Modal from "./Modal";
import Message from "./Message";
import { AnimatePresence, motion } from "framer-motion";
import ReportModal from "./ReportModal";
import PostVideo from "./PostVideo";

function Post(props) {
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const nav = useNavigate();
  const [messageError, setMessageError] = useState(false);
  const [post, setPost] = useState(props.post);
  const [comments, setComments] = useState(false);
  const [postOptions, setPostOptions] = useState(false);
  const [edited, setEdited] = useState(false);
  const [modalData, setModalData] = useState({});
  const [message, setMessage] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const optionsButton = useRef();
  console.log(optionsButton.current)
  useEffect(() => {
    document.onclick = (ev) => {
      if (ev.target !== optionsButton.current) {
        setPostOptions(false);
        console.log(postOptions)
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const formik = useFormik({
    initialValues: {
      content: post.content,
      images: post.images,
    },
    onSubmit: async (values) => {
      const { content, images } = values;
      const formData = new FormData();
      if (content.toString() !== post.content.toString())
        formData.append("content", content);
      console.log(images);
      if (images && images !== post.images)
        for (let i = 0; i <= images.length; i++) {
          formData.append("images", images[i]);
        }
      let isData = false;
      for (let data of formData) {
        isData = true;
        console.log(data);
      }
      if (isData) {
        try {
          const res = await axios({
            method: "PATCH",
            url: `/api/v1/posts/${post._id}`,
            headers: { Authorization: `Bearer ${token}` },
            data: formData,
          });
          console.log(res);
          if (res.data.status === "success") {
            setPost(res.data.post);
            setEdited(false);
          }
        } catch (error) {
          console.log(error);
        }
      }
    },
    validationSchema: Yup.object({
      content: Yup.string().required("يجب أن يكون هناك محتوى للمنشور"),
    }),
    // validate: (values) => {

    // },
  });

  const updateComments = (newComments) => {
    setPost((prevPost) => ({ ...prevPost, comments: [...newComments] }));
  };
  const likesCount = post.reactions?.filter(
    (reaction) => reaction.type === "like"
  ).length;
  const dislikesCount = post.reactions?.filter(
    (reaction) => reaction.type === "dislike"
  ).length;
  return (
    <>
      <div
        id={post._id}
        onClick={(e) => {
          if (post._id === e.target.id)
            return postOptions && setPostOptions(false);
        }}
        className="bg-slate-100 shadow-md dark:bg-slate-900 rounded p-4 md:p-6 flex flex-col gap-5 my-5"
      >
        <div className="flex justify-between items-center relative">
          <Link
            to={`/profile/${post?.user?.username}`}
            className="flex items-center gap-3"
          >
            <div>
              <img
                src={`/img/users/${post.user?.photo}`}
                alt={`صورة ${props?.user?.fullName}`}
                className="w-10 h-10 rounded-full overflow-hidden object-cover"
              />
            </div>
            <h3 className="font-bold">
              {post.user?.fullName}{" "}
              {post.user?.verified && (
                <span>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="align-middle text-green-500"
                  />
                </span>
              )}
            </h3>
          </Link>
          {!edited ? (
            <button
              ref={optionsButton}
              className="text-xl"
              onClick={() => setPostOptions((prev) => !prev)}
            >
              <FontAwesomeIcon icon={faEllipsisH} />
            </button>
          ) : (
            <button onClick={() => setEdited(false)} className="text-xl">
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
          <AnimatePresence>
            {postOptions && (
              <motion.div
                animate={{ originX: 0, originY: 0, scale: 1 }}
                initial={{ scale: 0 }}
                exit={{ scale: 0, originY: 0 }}
                className="absolute left-5 top-1/3 dark:bg-slate-800 bg-slate-200 p-3 w-48 rounded-md"
              >
                <ul
                  onClick={() => setPostOptions(false)}
                  className="*:flex *:justify-between *:items-center hover:*:bg-green-200 hover:*:dark:bg-slate-900 *:p-2 *:rounded-md"
                >
                  {user.role === "admin" ||
                  user.role === "moderator" ||
                  user.username === post.user?.username ? (
                    <li>
                      <button
                        onClick={() =>
                          setModalData({
                            message: "هل أنت متأكد من أنك تريد حذف المنشور؟",
                            hide: () => setModalData({}),
                            action: async () => {
                              try {
                                const res = await axios({
                                  url: `/api/v1/posts/${post._id}`,
                                  method: "DELETE",
                                  headers: { Authorization: `Bearer ${token}` },
                                });
                                console.log(res);
                                setMessage("تم حذف المنشور بنجاح");
                                setTimeout(setMessage, 3000, "");
                                nav(".", { replace: true });
                              } catch (error) {
                                console.log(error);
                              }
                              setModalData({});
                            },
                          })
                        }
                      >
                        حذف المنشور
                      </button>
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="text-red-500"
                      />
                    </li>
                  ) : (
                    <li
                      className="cursor-pointer"
                      onClick={() => setShowReport(true)}
                    >
                      <button>الإبلاغ عن المنشور</button>
                      <FontAwesomeIcon icon={faFlag} className="text-red-500" />
                    </li>
                  )}
                  {user.username === post.user.username && (
                    <li onClick={() => setEdited(true)}>
                      <button>تعديل المنشور</button>
                      <FontAwesomeIcon icon={faPen} />
                    </li>
                  )}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-gray-500 -mt-5 ms-12">
          <FontAwesomeIcon icon={faEarthAfrica} className="me-2 text-sm" />
          {new Date(post.createdAt).toLocaleString("ar", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {/* {new Date(post.createdAt).getSeconds(0)} */}
        </p>
        {!edited ? (
          <h3
            className={`break-words ${
              /^[a-zA-Z]/.test(post?.content) && "text-left"
            }`}
          >
            {post.content.split("\n").map((ele, i) => (
              <span key={`${post._id}-${i}-line`}>
                {ele} <br />{" "}
              </span>
            ))}
          </h3>
        ) : (
          <form className="flex items-center" onSubmit={formik.handleSubmit}>
            <textarea
              name="content"
              dir={/^[a-zA-Z]/.test(formik.values.content) ? "ltr" : "rtl"}
              value={formik.values.content}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) formik.submitForm();
              }}
              className="w-full resize-none dark:bg-slate-800 p-3 rounded-md outline-none"
            />
            {!post.video && (
              <label
                htmlFor="images"
                className="cursor-pointer text-green-500 text-xl p-3"
              >
                <FontAwesomeIcon icon={faImage} />
              </label>
            )}
            <input
              type="file"
              id="images"
              multiple
              className="hidden"
              onChange={(e) => {
                // console.log(formik.errors);
                formik.setFieldValue("images", e.target.files);
              }}
              onBlur={formik.handleBlur}
              accept="image/*"
            />
            <button
              disabled={
                formik.isSubmitting ||
                formik.values.content === "" ||
                (formik.values.content === post.content &&
                  formik.values.images === post.images)
              }
              // onClick={() => console.log(formik.errors)}
              className="text-green-500 disabled:text-green-900 p-3 text-xl"
              type="submit"
            >
              {!formik.isSubmitting ? (
                <FontAwesomeIcon icon={faPaperPlane} flip="horizontal" />
              ) : (
                <FontAwesomeIcon
                  icon={faCircleNotch}
                  className="text-green-500 animate-spin"
                />
              )}
            </button>
          </form>
        )}
        {post.images?.length > 0 ? (
          <PostImages images={post.images} fullName={post.user.fullName} />
        ) : (
          post.video && <PostVideo video={post.video} />
        )}
        <div className="flex justify-around items-center *:text-xl hover:*:bg-green-200 *:duration-200 hover:*:dark:bg-green-900 *:p-2 *:rounded-md">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={async () => {
              try {
                let route = "like";
                if (
                  post.reactions
                    ?.filter((reaction) => reaction.type === "like")
                    ?.find((reaction) => reaction.username === user.username)
                ) {
                  route = "cancelReaction";
                  setIsLiked(false);
                }
                if (route === "like") setIsLiked(true);
                const res = await axios({
                  headers: { Authorization: `Bearer ${token}` },
                  method: "PATCH",
                  url: `/api/v1/posts/${post._id}/${route}`,
                });
                if (res.data.status === "success") setPost(res.data.post);
                setIsDisliked(false);
                setIsLiked(false);
              } catch (error) {
                setIsLiked(false);
                console.log(error);
              }
            }}
            className="flex items-center justify-center"
          >
            <FontAwesomeIcon
              icon={faThumbsUp}
              className={`${
                (post.reactions
                  ?.filter((reaction) => reaction.type === "like")
                  .find((reaction) => reaction.username === user.username) ||
                  isLiked) &&
                "text-green-500"
              }`}
            />
            <span className="text-xl ms-2">
              {isLiked ? likesCount + 1 : likesCount}
            </span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={async () => {
              try {
                let route = "dislike";
                if (
                  post.reactions
                    .filter((reaction) => reaction.type === "dislike")
                    .find((reaction) => reaction.username === user.username)
                ) {
                  route = "cancelReaction";
                  setIsDisliked(false);
                }
                if (route === "dislike") setIsDisliked(true);
                const res = await axios({
                  headers: { Authorization: `Bearer ${token}` },
                  method: "PATCH",
                  url: `/api/v1/posts/${post._id}/${route}`,
                });
                console.log(res.data.post);
                if (res.data.status === "success") setPost(res.data.post);
                setIsLiked(false);
                setIsDisliked(false);
              } catch (err) {
                setIsDisliked(false);
                console.log(err.message);
              }
            }}
          >
            <FontAwesomeIcon
              icon={faThumbsDown}
              className={`${
                (post.reactions
                  ?.filter((reaction) => reaction.type === "dislike")
                  .find((reaction) => reaction.username === user.username) ||
                  isDisliked) &&
                "text-green-500"
              }`}
            />
            <span className="text-xl ms-2">
              {isDisliked ? dislikesCount + 1 : dislikesCount}
            </span>
          </motion.button>
          <button onClick={() => setComments((prevComments) => !prevComments)}>
            <FontAwesomeIcon icon={faMessage} />
            <span className="text-xl ms-2">{post?.comments?.length}</span>
          </button>
          <CopyToClipboard
            onCopy={(text, result) => {
              if (result) {
                setMessage("تم نسخ رابط المنشور بنجاح");
              } else {
                setMessage("حدث خطأ أثناء نسخ الرابط");
                setMessageError(true);
                setTimeout(setMessageError, 3500, false);
              }
              setTimeout(setMessage, 3000, "");
            }}
            text={`${window.location.host}/post/${post._id}`}
          >
            <button>
              <FontAwesomeIcon icon={faShare} />
            </button>
          </CopyToClipboard>
        </div>
        {comments && (
          <Comments
            comments={post.comments}
            postId={post._id}
            postUser={post.user}
            updateComments={updateComments}
          />
        )}
      </div>
      <Message message={message} error={messageError} />
      <Modal
        message={modalData.message}
        hide={modalData.hide}
        action={modalData.action}
      />
      <ReportModal
        show={showReport}
        hide={() => setShowReport(false)}
        reportedPost={post._id}
      />
    </>
  );
}

export default Post;
