import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFormik } from "formik";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Message from "../components/Message";
import * as Yup from "yup";
import axios from "axios";

function ActivateAccountPage() {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSent, setIsSent] = useState(
    searchParams.get("email") ? true : false
  );
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const formik = useFormik({
    initialValues: {
      email: "",
      verificationCode: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .required("يجب إدخال البريد الإلكتروني")
        .email("الرجاء إدخال البريد الإلكتروني بشكل صحيح"),
      verificationCode: Yup.number("يتكون رمز التحقق من رقم فقط")
        .min(100_000, "يجب أن يتكون رمز التحقق من 6 أحرف")
        .max(999_999, "يجب أن يتكون رمز التحقق من 6 أحرف"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await axios({
          method: isSent ? "PATCH" : "POST",
          url: `/api/v1/users/${isSent ? "completeActivateMe" : "activateMe"}`,
          data: values,
        });
        console.log(res);
        setMessage(res.data.message);
        if (!isSent) {
          setIsSent(true);
          setSearchParams((prev) => {
            prev.append("email", values.email);
            return prev;
          });
        } else {
          setTimeout(nav, 4000, "/login", { replace: true });
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
    <div className="flex-grow flex justify-center items-center px-5">
      <form
        className="w-full max-w-96 flex flex-col gap-3"
        onSubmit={formik.handleSubmit}
      >
        <h1 className="text-2xl font-bold mb-8 text-center">تفعيل حساب</h1>
        <label htmlFor="email">البريد الإلكتروني: </label>
        <input
          type="email"
          name="email"
          id="email"
          dir="ltr"
          disabled={isSent}
          placeholder="example@email.com"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.email}
          maxLength={30}
          className="border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100 disabled:grayscale peer"
        />
        {formik.errors.email && formik.touched.email && (
          <p className="text-red-400">{formik.errors.email}</p>
        )}
        {isSent && (
          <>
            <motion.label
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              htmlFor="verificationCode"
            >
              رمز التحقق
            </motion.label>
            <motion.input
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              type="text"
              id="verificationCode"
              name="verificationCode"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100 peer"
            />
            {formik.errors.verificationCode &&
              formik.touched.verificationCode && (
                <p className="text-red-400">{formik.errors.verificationCode}</p>
              )}
          </>
        )}
        <button
          disabled={formik.isSubmitting}
          className="bg-gradient-to-b from-green-400 to-green-600 py-4 w-full mt-5 rounded-md text-md font-bold"
          type="submit"
        >
          {formik.isSubmitting ? (
            <FontAwesomeIcon className="animate-spin" icon={faCircleNotch} />
          ) : (
            "إرسال"
          )}
        </button>
      </form>
      <Message message={message} error={messageError} />
    </div>
  );
}

export default ActivateAccountPage;
