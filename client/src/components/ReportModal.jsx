/* eslint-disable react/prop-types */
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useFormik } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import Message from "./Message";

function ReportModal({
  hide,
  show,
  reportedPost,
  reportedUser,
  reportedComment,
}) {
  const token = useSelector((state) => state.token);
  useEffect(() => {
    document.body.style.overflow = show && hide ? "hidden" : "auto";
  }, [show, hide]);
  const [message, setMessage] = useState("");
  const formik = useFormik({
    initialValues: {
      reason: "",
      description: "",
      reportedPost: reportedPost,
      reportedUser: reportedUser,
      reportedComment: reportedComment,
    },
    validationSchema: Yup.object({
      reason: Yup.string().required("يجب إدخال سبب للبلاغ"),
      description: Yup.string()
        .required("يجب إدخال وصف نصي يوضح الغرض من البلاغ")
        .min(50, "يجب أن يحتوي الوصف على 50 حرفاً على الأقل")
        .max(150, "يجب ألا يتخطى الوصف 150 حرفاً"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        console.log(reportedPost);
        const data = {};
        if (!values.reportedComment) console.log(true);
        for (const key in values) {
          if (Object.hasOwnProperty.call(values, key) && values[key]) {
            data[key] = values[key];
          }
        }
        console.log(data);
        const res = await axios({
          method: "POST",
          url: "/api/v1/reports",
          headers: { Authorization: `Bearer ${token}` },
          data,
        });
        console.log(res);
        if (res.status === 201) {
          setMessage("تم إرسال البلاغ بنجاح");
          setTimeout(setMessage, 3000, "");
          helpers.setValues({
            reason: "",
            description: "",
            reportedComment,
            reportedPost,
            reportedUser,
          });
          hide();
        }
      } catch (error) {
        console.log(error);
      }
    },
  });
  return (
    <>
      <AnimatePresence>
        {show && hide && (
          <motion.div
            id="overlay"
            onClick={(e) => {
              if (e.target.id === "overlay") hide();
            }}
            className="fixed z-50 top-0 start-0 w-screen h-screen bg-black  bg-opacity-60 flex justify-center items-center"
            exit={{ opacity: 0 }}
          >
            <motion.form
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onSubmit={formik.handleSubmit}
              className="p-6 bg-slate-100 w-80 sm:w-96 rounded-md relative dark:bg-slate-900 flex flex-col gap-5"
            >
              <h2 className="text-2xl font-bold text-center">بلاغ</h2>
              <p className="font-bold">السبب:</p>
              <div className="flex flex-wrap gap-3">
                {(() =>
                  [
                    "اعتداء لفظي",
                    "محتوى فاضح",
                    "كفر",
                    "إساءة",
                    "خطاب كراهية",
                    "عنصرية",
                  ].map((ele) => (
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
                  )))()}
              </div>
              {formik.errors.reason && formik.touched.reason && (
                <p className="text-red-400">{formik.errors.reason}</p>
              )}
              <label htmlFor="description" className="font-bold">
                الوصف:
              </label>
              <textarea
                name="description"
                id="description"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.description}
                className="resize-none bg-slate-300 rounded-md h-20 dark:bg-slate-800 p-3 outline-none focus:outline-none"
              />
              {formik.errors.description && formik.touched.description && (
                <p className="text-red-400">{formik.errors.description}</p>
              )}
              <button
                type="submit"
                className="mt-5 bg-gradient-to-b rounded-md from-green-500 to-green-700 font-bold py-1 text-white"
              >
                إرسال
              </button>
              <button
                type="button"
                onClick={() => {
                  formik.setValues({
                    description: "",
                    reason: "",
                    reportedComment,
                    reportedPost,
                    reportedUser,
                  });
                  hide();
                }}
                className="text-xl dark:text-green-100 text-gray-700 absolute end-5 top-5"
              >
                <FontAwesomeIcon icon={faXmarkCircle} />
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
      <Message message={message} />
    </>
  );
}

export default ReportModal;
