import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFormik } from "formik";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import axios from "axios";
import { useState } from "react";

function ResetPasswordPage() {
  const nav = useNavigate();
  const params = useParams();
  const [message, setMessage] = useState("");
  const [search] = useSearchParams();
  const formik = useFormik({
    initialValues: {
      email: search.get("email"),
      password: "",
      passwordConfirm: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().required().email(),
      password: Yup.string()
        .required("يجب إدخال كلمة المرور")
        .matches(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
          "كلمة المرور ضعيفة"
        ),
      passwordConfirm: Yup.string().oneOf(
        [Yup.ref("password"), null],
        "كلمة المرور غير متطابقة"
      ),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const res = await axios({
          method: "PATCH",
          url: `/api/v1/users/resetPassword/${params.resetToken}`,
          data: values,
        });
        if (res.data.status === "success") {
          setMessage(res.data.message);
          setTimeout(nav, 3000, "/login", { replace: true });
        }
      } catch (error) {
        console.log(error);
        helpers.setErrors({ message: error?.response?.data?.message });
        setTimeout(nav, 3000, "/forgot-password");
      }
    },
  });
  console.log(formik.errors);
  return (
    <div className="flex-grow flex justify-center items-center">
      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col gap-3 w-full max-w-[35rem] p-3"
      >
        <h1 className="text-2xl font-bold text-center mb-8">
          استعادة كلمة المرور
        </h1>
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
        <label htmlFor="password">كلمة المرور: </label>
        <input
          type="password"
          name="password"
          id="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
          className="border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100"
        />
        {formik.errors.password && formik.touched.password && (
          <p className="text-red-400">{formik.errors.password}</p>
        )}
        <label htmlFor="passwordConfirm">تأكيد كلمة المرور: </label>
        <input
          type="password"
          name="passwordConfirm"
          id="passwordConfirm"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.passwordConfirm}
          className="border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100"
        />
        {formik.errors.passwordConfirm && formik.touched.passwordConfirm && (
          <p className="text-red-400">{formik.errors.passwordConfirm}</p>
        )}
        {formik.errors.message ? (
          <p className="text-red-400 font-bold">{formik.errors.message}</p>
        ) : (
          message && <p className="text-green-400 font-bold">{message}</p>
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
      </form>
    </div>
  );
}

export default ResetPasswordPage;
