import {
  faCircleNotch,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Message from "../components/Message";
import { setLogout } from "../store/authSlice";

function DeleteAccountPage() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [params, setParams] = useSearchParams();
  console.log();
  const [isSent, setIsSent] = useState(
    params.get("email") === user.email ? true : false
  );
  const formik = useFormik({
    initialValues: {
      password: "",
      verificationCode: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .required("يجب إدخال كلمة المرور")
        .min(8, "يجب أن تحتوي كلمة المرور على 8 حروف أو أكثر"),
      verificationCode: Yup.number("رمز التحقق يتكون من أرقام فقط")
        .integer()
        .min(100000, "يجب أن يتكون رمز التحقق من 6 أرقام")
        .max(999999, "يجب أن يتكون رمز التحقق من 6 أرقام فقط"),
    }),
    onSubmit: async (values) => {
      const { password, verificationCode } = values;
      try {
        const res = await axios({
          method: isSent ? "DELETE" : "POST",
          url: "/api/v1/users/deleteAccount",
          headers: { Authorization: `Bearer ${token}` },
          data: isSent ? { verificationCode } : { password },
        });
        console.log(res);
        setMessage(res?.data?.message);
        if (!isSent) {
          setIsSent(true);
          setParams((prev) => {
            prev.set("email", user.email);
            return prev;
          });
        } else {
          axios({
            method: "GET",
            url: "/api/v1/users/logout",
          }).then(() => {
            dispatch(setLogout());
            nav("/login");
          });
          setMessage("تم حذف الحساب بنجاح");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setTimeout(setMessage, 3000, "");
      }
    },
  });
  return (
    <div className="h-full flex justify-center items-center">
      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col max-w-[35rem] w-full gap-4"
      >
        <h2 className="font-bold text-2xl text-center mb-8">حذف الحساب!</h2>
        <label htmlFor="password" className="font-bold">
          كلمة المرور:
        </label>
        <div className="w-full relative">
          <input
            disabled={isSent}
            type={!showPassword ? "password" : "text"}
            id="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="border-green-500 disabled:grayscale w-full outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-gray-500 absolute left-5 top-1/2 -translate-y-1/2"
          >
            {showPassword ? (
              <FontAwesomeIcon icon={faEye} />
            ) : (
              <FontAwesomeIcon icon={faEyeSlash} />
            )}
          </button>
        </div>
        {formik.errors.password && formik.touched.password && (
          <p className="text-red-400">{formik.errors.password}</p>
        )}
        {isSent && (
          <>
            <motion.label
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              htmlFor="verificationCode"
              className="font-bold"
            >
              رمز التحقق:
            </motion.label>
            <motion.input
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              type="text"
              name="verificationCode"
              id="verificationCode"
              value={formik.values.verificationCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border-green-500 w-full outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100"
            />
          </>
        )}
        <button
          type="submit"
          className="p-3 mt-5 rounded-md font-bold text-lg bg-gradient-to-b from-green-400 to-green-600"
        >
          {formik.isSubmitting ? (
            <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
          ) : (
            "إرسال"
          )}
        </button>
      </form>
      <Message message={message} />
    </div>
  );
}

export default DeleteAccountPage;
