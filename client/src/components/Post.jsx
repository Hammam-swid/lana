/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";
import PostImages from "./PostImages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import { useState } from "react";
import axios from "axios";
import Comments from "./Comments";
import { useFormik } from "formik";
import * as Yup from "yup";
import Modal from "./Modal";
import Message from "./Message";
import { AnimatePresence, motion } from "framer-motion";

function Post(props) {
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const nav = useNavigate();
  const [post, setPost] = useState(props.post);
  const [comments, setComments] = useState(false);
  const [postOptions, setPostOptions] = useState(false);
  const [edited, setEdited] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [postCopied, setPostCopied] = useState(false);
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
  return (
    <>
      <div
        id={post._id}
        onClick={(e) => {
          if (post._id === e.target.id)
            return postOptions && setPostOptions(false);
        }}
        onDoubleClick={() => nav(`/post/${post._id}`)}
        className="bg-slate-100 shadow-md dark:bg-slate-900 rounded p-6 flex flex-col gap-5 my-5"
      >
        <div className="flex justify-between items-center relative">
          <Link
            to={`/profile/${post.user.username}`}
            className="flex items-center gap-3"
          >
            <div>
              <img
                src={`/img/users/${post.user.photo}`}
                alt={`صورة ${props?.user?.fullName}`}
                className="w-10 h-10 rounded-full overflow-hidden object-cover"
              />
            </div>
            <h3 className="font-bold">
              {post.user.fullName}{" "}
              {post.user.verified && (
                <span>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-500"
                  />
                </span>
              )}
            </h3>
          </Link>
          {!edited ? (
            <button
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
                  user.role === "supervisor" ||
                  user.username === post.user.username ? (
                    <li>
                      <button onClick={() => setShowModal(true)}>
                        حذف المنشور
                      </button>
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="text-red-500"
                      />
                    </li>
                  ) : (
                    <li>
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
          })}
          {/* {new Date(post.createdAt).getSeconds(0)} */}
        </p>
        {!edited ? (
          <h3>{post.content}</h3>
        ) : (
          <form className="flex items-center" onSubmit={formik.handleSubmit}>
            <textarea
              name="content"
              value={formik.values.content}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) formik.submitForm();
              }}
              className="w-full dark:bg-slate-800 p-3 rounded-md outline-none"
            />
            <label
              htmlFor="images"
              className="cursor-pointer text-green-500 text-xl p-3"
            >
              <FontAwesomeIcon icon={faImage} />
            </label>
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
        {post.images?.length > 0 && (
          <PostImages images={post.images} fullName={post.user.fullName} />
        )}
        <div className="flex justify-around items-center *:text-xl hover:*:bg-green-200 *:duration-200 hover:*:dark:bg-green-900 *:p-2 *:rounded-md">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={async () => {
              try {
                let route = "like";
                if (
                  post.reactions
                    ?.filter((reaction) => reaction.type === "like")
                    ?.find((reaction) => reaction.username === user.username)
                ) {
                  route = "cancelReaction";
                }
                const res = await axios({
                  headers: { Authorization: `Bearer ${token}` },
                  method: "PATCH",
                  url: `/api/v1/posts/${post._id}/${route}`,
                });
                if (res.data.status === "success") setPost(res.data.post);
              } catch (error) {
                console.log(error);
              }
            }}
            className="flex items-center justify-center"
          >
            <FontAwesomeIcon
              icon={faThumbsUp}
              className={
                post.reactions
                  ?.filter((reaction) => reaction.type === "like")
                  .find((reaction) => reaction.username === user.username) &&
                "text-green-500"
              }
            />
            <span className="text-xl ms-2">
              {
                post.reactions?.filter((reaction) => reaction.type === "like")
                  .length
              }
            </span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={async () => {
              try {
                let route = "dislike";
                if (
                  post.reactions
                    .filter((reaction) => reaction.type === "dislike")
                    .find((reaction) => reaction.username === user.username)
                ) {
                  route = "cancelReaction";
                }
                const res = await axios({
                  headers: { Authorization: `Bearer ${token}` },
                  method: "PATCH",
                  url: `/api/v1/posts/${post._id}/${route}`,
                });
                console.log(res.data.post);
                if (res.data.status === "success") setPost(res.data.post);
              } catch (err) {
                console.log(err.message);
              }
            }}
          >
            <FontAwesomeIcon
              icon={faThumbsDown}
              className={
                post.reactions
                  ?.filter((reaction) => reaction.type === "dislike")
                  .find((reaction) => reaction.username === user.username) &&
                "text-green-500"
              }
            />
            <span className="text-xl ms-2">
              {
                post.reactions?.filter(
                  (reaction) => reaction.type === "dislike"
                ).length
              }
            </span>
          </motion.button>
          <button onClick={() => setComments((prevComments) => !prevComments)}>
            <FontAwesomeIcon icon={faMessage} />
            <span className="text-xl ms-2">{post?.comments?.length}</span>
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `http://localhost:5173/post/${post._id}`
              );
              setPostCopied(true);
              setTimeout(setPostCopied, 3000, false);
            }}
          >
            <FontAwesomeIcon icon={faShare} />
          </button>
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
      {postCopied && <Message message={"تم نسخ رابط المنشور"} />}
      {showModal && (
        <Modal
          message="هل أنت متأكد من أنك تريد حذف هذا المنشور؟"
          hide={() => setShowModal(false)}
          action={async () => {
            try {
              const res = await axios({
                url: `/api/v1/posts/${post._id}`,
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              console.log(res);
            } catch (error) {
              console.log(error);
            }
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

export default Post;
