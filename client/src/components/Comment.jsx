/* eslint-disable react/prop-types */
import {
  faCheckCircle,
  faCircleNotch,
  faEllipsisH,
  faFlag,
  faPaperPlane,
  faPen,
  // faEllipsisH,
  // faEllipsisVertical,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import Modal from "./Modal";
import { AnimatePresence, motion } from "framer-motion";

function Comment({ comment, removeComment, updateComments, postId, postUser }) {
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);
  const [options, setOptions] = useState(false);
  const [edited, setEdited] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const formik = useFormik({
    initialValues: {
      text: comment.text,
    },
    validationSchema: Yup.object({
      text: Yup.string().required("يجب إدخال النص"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await axios({
          method: "PATCH",
          url: `/api/v1/posts/${postId}/comment/${comment._id}`,
          headers: { Authorization: `Bearer ${token}` },
          data: values,
        });
        console.log(res);
        if (res.data.status === "success") {
          updateComments(res.data.comments);
          setEdited(false);
        }
      } catch (error) {
        console.log(error);
      }
    },
  });
  return (
    <>
      <div
        className="p-3 flex items-center gap-3"
        onClick={() => {
          if (options) setOptions(false);
        }}
      >
        <Link to={`/profile/${comment.user.username}`}>
          <img
            src={`/img/users/${comment.user.photo}`}
            alt={`صورة ${comment.user.fullName}`}
            className="w-10 h-10 rounded-full overflow-hidden object-cover"
          />
        </Link>
        <div className="dark:bg-slate-900 bg-slate-100 p-3 rounded-md flex-1 relative">
          <Link
            to={`/profile/${comment.user.username}`}
            className="font-bold mb-2"
          >
            {comment.user.fullName}
            {comment.user.verified && (
              <span>
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-xl text-green-500"
                />
              </span>
            )}
          </Link>
          {!edited ? (
            <p>{comment.text}</p>
          ) : (
            <form onSubmit={formik.handleSubmit}>
              <div className="w-full mt-5 flex gap-2">
                <input
                  type="text"
                  name="text"
                  autoFocus
                  className="flex-1 dark:bg-slate-800 p-2 rounded-md"
                  value={formik.values.text}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="submit"
                  className="shrink-0 text-green-500 disabled:text-green-900"
                  disabled={
                    formik.isSubmitting ||
                    formik.values.text === "" ||
                    formik.values.text === comment.text
                  }
                >
                  {!formik.isSubmitting ? (
                    <FontAwesomeIcon icon={faPaperPlane} flip="horizontal" />
                  ) : (
                    <FontAwesomeIcon
                      icon={faCircleNotch}
                      className="animate-spin text-green-500"
                    />
                  )}
                </button>
              </div>
            </form>
          )}
          {!edited ? (
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2"
              id={`${comment._id}-options`}
              onClick={() => setOptions((prev) => !prev)}
            >
              <FontAwesomeIcon icon={faEllipsisH} />
            </button>
          ) : (
            <button
              type="button"
              className="absolute left-3 top-3"
              onClick={() => {
                setEdited(false);
                formik.setValues({ text: comment.text });
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
          <AnimatePresence>
            {options && (
              <motion.ul
                animate={{ originX: 0.5, originY: 0, scale: 1 }}
                initial={{ scale: 0 }}
                exit={{ scale: 0, originY: 0, originX: 0 }}
                className="dark:bg-slate-800 bg-slate-300 shadow-md absolute z-20 left-0 p-3 rounded-md dark:hover:*:bg-slate-900 *:p-2 *:rounded-md"
                onClick={() => setOptions(false)}
              >
                {comment.user.username === user.username ||
                user.username === postUser.username ||
                user.role === "admin" ||
                user.role === "supervisor" ? (
                  <li>
                    <button
                      className="flex justify-between items-center w-full"
                      onClick={() => setShowModal(true)}
                    >
                      <span>حذف التعليق</span>{" "}
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="text-red-500"
                      />
                    </button>
                  </li>
                ) : (
                  <li>
                    <button className="flex justify-between items-center gap-2 w-full">
                      <span>الإبلاغ عن التعليق</span>
                      <FontAwesomeIcon icon={faFlag} className="text-red-500" />
                    </button>
                  </li>
                )}
                {user.username === comment.user.username && (
                  <li>
                    <button
                      onClick={() => setEdited(true)}
                      className="flex justify-between items-center gap-2"
                    >
                      <span>تعديل التعليق</span>
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                  </li>
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
      {showModal && (
        <Modal
          message="هل أنت متأكد من أنك تريد حذف هذا التعليق؟"
          hide={() => setShowModal(false)}
          action={async () => {
            try {
              const res = await axios({
                method: "DELETE",
                url: `/api/v1/posts/${postId}/comment/${comment._id}`,
                headers: { Authorization: `Bearer ${token}` },
              });
              console.log(res);
              if (res.status === 204) {
                removeComment(comment._id);
              }
            } catch (error) {
              console.log(error);
            }
          }}
        />
      )}
    </>
  );
}

export default Comment;
