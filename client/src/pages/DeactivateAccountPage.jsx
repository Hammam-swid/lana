import { useFormik } from "formik";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { setLogout } from "../store/authSlice";
import Message from "../components/Message";

function DeactivateAccountPage() {
  const [query, setQuery] = useSearchParams();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [submitted, setSubmitted] = useState(
    query.get("email") === user.email ? true : false
  );
  const [message, setMessage] = useState("");
  const formik = useFormik({
    initialValues: {
      email: user.email,
      password: "",
      verificationCode: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .required("الرجاء إدخال البريد الإلكتروني")
        .email("البريد الإلكتروني غير صحيح"),
      password: Yup.string().min(8, "يجب أن تحتوي كلمة السر على 8 أحرف فأكثر"),
      verificationCode: Yup.number("يجب أن يتكون رمز التحقق من أرقام فقط")
        .min(100000, "يجب أن يتكون رمز التحقق من 6 أرقام")
        .max(999999, "يجب أن يتكون رمز التحقق من 6 أرقام"),
    }),
    onSubmit: async (values) => {
      try {
        if (!submitted && query.get("email") !== user.email) {
          const { email } = values;
          const res = await axios({
            method: "POST",
            url: "/api/v1/users/deactivateMe",
            headers: { Authorization: `Bearer ${token}` },
            data: { email },
          });
          console.log(res);
          if (res.data.status === "success") {
            setMessage(res.data.message);
            setTimeout(setMessage, 3000, "");
            setSubmitted(true);
            setQuery((prevQuery) => {
              prevQuery.set("email", user.email);
              return prevQuery;
            });
          }
        } else {
          const res = await axios({
            method: "PATCH",
            url: "/api/v1/users/completeDeactivateMe",
            headers: { Authorization: `Bearer ${token}` },
            data: values,
          });
          if (res.data.status === "success") {
            dispatch(setLogout());
            nav("/login");
          }
        }
      } catch (error) {
        console.log(error);
        if (error.response.status === 404) {
          setMessage(error.response.data.message);
        }
      }
    },
  });
  return (
    <form
      className="flex flex-col max-w-[35rem] p-3 mx-auto gap-5 top-1/2 relative -translate-y-1/2"
      onSubmit={formik.handleSubmit}
    >
      <label htmlFor="email">البريد الإلكتروني: </label>
      <input
        type="email"
        name="email"
        id="email"
        disabled
        dir="ltr"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.email}
        className="border-green-500 outline-none border-2 p-3 rounded-lg disabled:text-gray-700 disabled:border-gray-700 dark:bg-slate-900 dark:text-green-100"
      />
      {submitted && (
        <>
          <label htmlFor="password">كلمة المرور: </label>
          <input
            type="password"
            name="password"
            id="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            required
            className="border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100"
          />
          {formik.errors.password && formik.touched.password && (
            <p className="text-red-400">{formik.errors.password}</p>
          )}
          <label htmlFor="verificationCode">رمز التحقق: </label>
          <input
            type="text"
            name="verificationCode"
            id="verificationCode"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.verificationCode}
            required
            className="border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100"
          />
          {formik.errors.verificationCode &&
            formik.touched.verificationCode && (
              <p className="text-red-400">{formik.errors.verificationCode}</p>
            )}
        </>
      )}
      <button
        type="submit"
        className="p-3 mt-5 rounded-sm font-bold text-lg bg-gradient-to-b from-green-400 to-green-600"
      >
        {formik.isSubmitting ? (
          <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
        ) : (
          "إرسال"
        )}
      </button>
      <Message message={message} />
    </form>
  );
}

export default DeactivateAccountPage;
