/* eslint-disable react/prop-types */
import { useState } from "react";
import Comment from "./Comment";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import * as Yup from "yup";
import { motion } from "framer-motion";

function Comments(props) {
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const [comments, setComments] = useState(props.comments);
  const formik = useFormik({
    initialValues: { text: "" },
    validationSchema: Yup.object({
      text: Yup.string().required("يجب إدخال نص للتعليق"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const res = await axios({
          method: "POST",
          url: `/api/v1/posts/${props.postId}/comment`,
          headers: { Authorization: `Bearer ${token}` },
          data: values,
        });
        if (res.data.status === "success") {
          console.log(res.data.comments);
          const { comments } = res.data;
          setComments(comments);
          props.updateComments(comments);
          helpers.setFieldValue("text", "");
        }
      } catch (error) {
        console.log(error);
      }
    },
  });

  const removeComment = (commentId) => {
    setComments((prevComments) => {
      const newComments = prevComments.filter(
        (comment) => comment._id !== commentId
      );
      props.updateComments(newComments);
      return newComments;
    });
  };
  const updateComments = (newComments) => {
    setComments(newComments);
    props.updateComments(newComments);
  };
  return (
    <motion.div
      initial={{ scaleY: 0.8 }}
      animate={{ scaleY: 1, originY: 0 }}
      className="dark:bg-slate-950 bg-slate-200 p-2 md:p-6 rounded-md flex flex-col gap-5"
    >
      {comments.length > 0 ? (
        comments.map((comment) => (
          <Comment
            key={comment._id}
            comment={comment}
            postId={props.postId}
            postUser={props.postUser}
            removeComment={removeComment}
            updateComments={updateComments}
          />
        ))
      ) : (
        <p className="text-gray-500">لا توجد تعليقات</p>
      )}
      <form
        onSubmit={formik.handleSubmit}
        className="flex gap-5 dark:bg-slate-900 bg-slate-100 p-3 items-center rounded-md outline-none border-none focus:outline-none"
      >
        <img
          src={`/img/users/${user.photo}`}
          alt={`صورة ${user.fullName}`}
          className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden"
        />
        <input
          type="text"
          name="text"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder={`التعليق كـ${user.fullName}`}
          value={formik.values.text}
          aria-multiline={true}
          className="flex-1 w-1 outline-none dark:bg-slate-800 bg-gray-200 p-3 rounded-md h-14"
        />
        <button
          type="submit"
          className="text-green-500 disabled:text-green-900"
          disabled={
            formik.isSubmitting ||
            formik.errors.text ||
            formik.values.text === ""
          }
        >
          {formik.isSubmitting ? (
            <FontAwesomeIcon
              icon={faCircleNotch}
              className="animate-spin text-green-500"
            />
          ) : (
            <FontAwesomeIcon icon={faPaperPlane} flip="horizontal" />
          )}
        </button>
      </form>
    </motion.div>
  );
}

export default Comments;
