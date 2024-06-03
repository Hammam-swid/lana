/* eslint-disable react/prop-types */
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useFormik } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import Message from "./Message";

function AddModerator({ hide, show }) {
  const token = useSelector((state) => state.token);
  useEffect(() => {
    document.body.style.overflow = show && hide ? "hidden" : "auto";
  }, [show, hide]);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const formik = useFormik({
    initialValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      role: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .required("الرجاء إدخال البريد الإلكتروني")
        .email("الرجاء إدخال البريد الإلكتروني بشكل صحيح"),
      fullName: Yup.string().required("يجب إدخال الاسم الكامل"),
      username: Yup.string().required("يجب إدخال اسم المستخدم"),
      password: Yup.string()
        .required("يجب إدخال كلمة المرور")
        .min(8, "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل")
        .matches(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
          "كلمة المرور ضعيفة"
        ),
      role: Yup.string().required("يجب اختيار وظيفة"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await axios({
          method: "POST",
          url: "/api/v1/users/moderators",
          headers: { Authorization: `Bearer ${token}` },
          data: values,
        });
        console.log(res);
        setMessage("تمت إضافة مشرف بنجاح");
      } catch (error) {
        console.log(error);
        setMessage(
          error.response.data.message || "حدث خطأ أثناء تنفيذ العملية"
        );
        setMessageError(true);
      } finally {
        setTimeout(setMessage, 3000, "");
        setTimeout(setMessageError, 3100, false);
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
              className="p-6 bg-slate-100 w-1/3 rounded-md relative dark:bg-slate-900 flex flex-col gap-3"
            >
              <h2 className="text-2xl font-bold text-center">إضافة مشرف</h2>
              <label htmlFor="email" className="font-bold">
                البريد الإلكتروني:{" "}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full bg-slate-300 dark:bg-slate-800 p-2 rounded-md outline-none focus:outline-none"
              />
              {formik.errors.email && formik.touched.email && (
                <p className="text-red-400">{formik.errors.email}</p>
              )}
              <label htmlFor="fullName" className="font-bold">
                الاسم الكامل:{" "}
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full bg-slate-300 dark:bg-slate-800 p-2 rounded-md outline-none focus:outline-none"
              />
              {formik.errors.fullName && formik.touched.fullName && (
                <p className="text-red-400">{formik.errors.fullName}</p>
              )}
              <label htmlFor="username" className="font-bold">
                اسم المستخدم (username):{" "}
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full bg-slate-300 dark:bg-slate-800 p-2 rounded-md outline-none focus:outline-none"
              />
              {formik.errors.username && formik.touched.username && (
                <p className="text-red-400">{formik.errors.username}</p>
              )}
              <label htmlFor="password" className="font-bold">
                كلمة المرور:{" "}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full bg-slate-300 dark:bg-slate-800 p-2 rounded-md outline-none focus:outline-none"
              />
              {formik.errors.password && formik.touched.password && (
                <p className="text-red-400">{formik.errors.password}</p>
              )}
              <p className="font-bold">الوظيفة: </p>
              <div className="flex gap-3">
                <div>
                  <input
                    type="radio"
                    name="role"
                    id="admin"
                    value="admin"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    checked={formik.values.role === "admin"}
                    className="hidden peer"
                  />
                  <label
                    htmlFor="admin"
                    className="peer-checked:font-bold py-2 cursor-pointer px-3 block bg-green-500 bg-opacity-20 peer-checked:bg-opacity-70 rounded-full duration-200"
                  >
                    مدير النظام
                  </label>
                </div>
                <div>
                  <input
                    type="radio"
                    name="role"
                    id="moderator"
                    value="moderator"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    checked={formik.values.role === "moderator"}
                    className="hidden peer"
                  />
                  <label
                    htmlFor="moderator"
                    className="peer-checked:font-bold py-2 cursor-pointer px-3 block bg-green-500 bg-opacity-20 peer-checked:bg-opacity-70 rounded-full duration-200"
                  >
                    مشرف النظام
                  </label>
                </div>
              </div>
              {formik.errors.role && formik.touched.role && (
                <p className="text-red-400">{formik.errors.role}</p>
              )}
              <button
                disabled={formik.isSubmitting}
                type="submit"
                className="bg-gradient-to-b from-green-500 to-green-700 text-xl font-bold py-2 mt-10 text-green-50 rounded-md"
              >
                {formik.isSubmitting ? (
                  <FontAwesomeIcon
                    icon={faCircleNotch}
                    className="animate-spin"
                  />
                ) : (
                  "إضافة"
                )}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
      <Message message={message} error={messageError} />
    </>
  );
}

export default AddModerator;
