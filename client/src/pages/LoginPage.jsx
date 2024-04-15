import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setLogin } from "../store/authSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useFormik } from "formik";
import * as Yup from "yup";

function LoginPage() {
  const theme = useSelector((state) => state.theme);
  const nav = useNavigate();
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .required("يجب إدخال البريد الإلكتروني")
        .email("الرجاء إدخال البريد الإلكتروني بشكل صحيح"),
      password: Yup.string()
        .required("يجب إدخال كلمة المرور")
        .min(8, "يجب أن تحتوي كلمة المرور على 8 حروف أو أكثر"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await axios({
          url: "/api/v1/users/login",
          method: "POST",
          data: values,
        });
        console.log(res.data.status);
        if (res.data.status === "success") {
          const { token } = res.data;
          const { user } = res.data.data;
          dispatch(setLogin({ token, user }));
          return nav("/");
        }
      } catch (error) {
        console.log(error);
      }
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="min-h-screen flex-col md:flex-row flex justify-center items-center bg-green-50 dark:bg-slate-900">
      <div>
        <img
          className="w-80 md:max-w-96"
          src={
            theme === "dark"
              ? "./src/assets/darkLanaLogo.png"
              : "./src/assets/lanaLogo.png"
          }
          alt="شعار منصة لنا"
        />
      </div>
      <form
        onSubmit={formik.handleSubmit}
        className="p-6 flex flex-col w-full max-w-screen-sm gap-5"
      >
        <h1 className="self-center font-bold text-3xl dark:text-green-100">
          مرحباً بكم!
        </h1>
        <p className="self-center text-gray-600">تسجيل الدخول إلى حسابك</p>
        <label htmlFor="email" className="dark:text-green-100">
          البريد الإلكتروني
        </label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="example@email.com"
          dir="ltr"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100 invalid:border-red-400 peer"
        />
        {formik.errors.email && formik.touched.email && (
          <p className="text-red-400 mt-[-15px]">{formik.errors.email}</p>
        )}
        <label htmlFor="password" className="dark:text-green-100">
          كلمة المرور
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            placeholder="أدخل كلمة المرور الخاصة بك هنا"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="border-green-500 outline-none border-2 p-3 rounded-lg w-full  dark:bg-slate-900 dark:text-green-100"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute end-5 top-1/2 -translate-y-1/2 text-gray-500"
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
        <Link to="/forgot-password" className="text-green-500 underline w-fit">
          هل نسيت كلمة المرور؟
        </Link>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="bg-gradient-to-t from-green-600 py-5 to-green-400 text-white mt-16 rounded-lg font-bold"
        >
          {formik.isSubmitting ? (
            <span className="w-6 h-6 border-2 border-white dark:border-green-50 border-r-green-900 dark:border-r-slate-900 animate-spin inline-block rounded-full"></span>
          ) : (
            "تسجيل الدخول"
          )}
        </button>
        <p className="self-center dark:text-green-100">
          ليس لديك حساب؟{" "}
          <Link to="/signup" className="text-green-500 underline">
            دعنا نقوم بإنشاء حساب
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
