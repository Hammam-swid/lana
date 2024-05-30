/* eslint-disable react/prop-types */
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useFormik } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import Message from "./Message";

function WarningForm({ show, hide, userId }) {
  const token = useSelector((state) => state.token);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "auto";
  }, [show]);
  const formik = useFormik({
    initialValues: {
      type: "",
      reason: "",
      message: "",
    },
    validationSchema: Yup.object({
      type: Yup.string().required("يجب إدخال النوع"),
      reason: Yup.string().required("يجب إدخال السبب"),
      message: Yup.string().required("يجب إدخال رسالة توضيحية"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const res = await axios({
          method: "PATCH",
          url: `/api/v1/users/${userId}/warning`,
          data: values,
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res);
        if (res.status === 200) {
          setMessage(res.data.message);
          helpers.setValues({ type: "", message: "", reason: "" });
          hide();
        }
      } catch (error) {
        console.log(error);
        setMessage(error.response.data.message);
        setMessageError(true);
      } finally {
        setTimeout(setMessage, 3000, "");
        setTimeout(setMessageError, 3500, false);
      }
    },
  });
  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            id="overlay"
            onClick={(e) => {
              if (e.target.id === "overlay") hide();
            }}
            exit={{ opacity: 0 }}
            className="fixed start-0 top-0 h-full w-full z-50 bg-black bg-opacity-60 flex justify-center items-center px-3"
          >
            <motion.form
              onSubmit={formik.handleSubmit}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="dark:bg-slate-900 bg-slate-100 p-6 rounded-md w-full max-w-[27rem] flex flex-col gap-3"
            >
              <h1 className="text-2xl text-center font-bold">
                <span>تحذير المستخدم</span>
                <FontAwesomeIcon
                  icon={faWarning}
                  className="text-yellow-500 ms-4 align-middle"
                />
              </h1>
              <label className="font-bold">النوع:</label>
              <div className="flex gap-3">
                <div>
                  <input
                    type="radio"
                    id="post"
                    name="type"
                    value={"post"}
                    checked={formik.values.type === "post"}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="peer hidden"
                  />
                  <label
                    htmlFor="post"
                    className="peer-checked:font-bold py-2 cursor-pointer px-3 block bg-green-500 bg-opacity-20 peer-checked:bg-opacity-70 rounded-full duration-200"
                  >
                    منشور
                  </label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="comment"
                    name="type"
                    value={"comment"}
                    checked={formik.values.type === "comment"}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="peer hidden"
                  />
                  <label
                    htmlFor="comment"
                    className="peer-checked:font-bold py-2 cursor-pointer px-3 block bg-green-500 bg-opacity-20 peer-checked:bg-opacity-70 rounded-full duration-200"
                  >
                    تعليق
                  </label>
                </div>
              </div>
              {formik.errors.type && formik.touched.type && (
                <p className="text-red-400">{formik.errors.type}</p>
              )}
              <label className="font-bold">السبب</label>
              <div className="flex gap-3 flex-wrap">
                {(() =>
                  ["اعتداء لفظي", "إساءة", "خطاب كراهية", "عنصرية"].map(
                    (ele) => (
                      <p key={ele}>
                        <input
                          type="radio"
                          id={ele}
                          value={ele}
                          name="reason"
                          onChange={formik.handleChange}
                          checked={formik.values.reason === ele}
                          className="hidden peer"
                        />
                        <label
                          htmlFor={ele}
                          className="peer-checked:font-bold py-2 cursor-pointer px-3 block bg-green-500 bg-opacity-20 peer-checked:bg-opacity-70 rounded-full duration-200"
                        >
                          {ele}
                        </label>
                      </p>
                    )
                  ))()}
              </div>
              {formik.errors.reason && formik.touched.reason && (
                <p className="text-red-400">{formik.errors.reason}</p>
              )}

              <label htmlFor="message" className="font-bold">
                رسالة:
              </label>
              <textarea
                name="message"
                id="message"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.message}
                className="resize-none bg-slate-300 dark:bg-slate-800 rounded-md focus:outline-none p-3 h-24"
              />
              {formik.errors.message && formik.touched.message && (
                <p className="text-red-400">{formik.errors.message}</p>
              )}

              <button
                type="submit"
                className="bg-gradient-to-b from-green-500 to-green-700 py-2 text-xl font-bold rounded-md text-green-50 mt-8"
              >
                إرسال
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
      <Message message={message} error={messageError} />
    </>
  );
}

export default WarningForm;
