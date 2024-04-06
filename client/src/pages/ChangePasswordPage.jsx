import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { setLogin } from "../store/authSlice";

function ChangePasswordPage() {
  const token = useSelector((state) => state.token);
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      password: "",
      passwordConfirm: "",
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("يجب إدخال كلمة المرور الحالية"),
      password: Yup.string()
        .required("يجب إدخال كلمة المرور الجديدة")
        .matches(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
          "كلمة المرور ضعيفة"
        ),
      passwordConfirm: Yup.string()
        .required("يجب تأكيد كلمة المرور")
        .oneOf([Yup.ref("password"), null], "كلمة المرور غير متطابقة"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const res = await axios({
          method: "PATCH",
          url: "/api/v1/users/updateMyPassword",
          headers: { Authorization: `Bearer ${token}` },
          data: values,
        });
        if (res.data.status === "success") {
          dispatch(setLogin({ user: res.data.user, token: res.data.token }));
        }
      } catch (error) {
        console.log(error);
        helpers.setErrors({ currentPassword: error.response.data.message });
      }
    },
  });
  return (
    <form
      className="flex flex-col gap-5 max-w-[35rem] mx-auto relative top-1/2 -translate-y-1/2"
      onSubmit={formik.handleSubmit}
    >
      <label htmlFor="currentPassword">كلمة المرور الحالية:</label>
      <input
        type="password"
        name="currentPassword"
        id="currentPassword"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.currentPassword}
        className="border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100"
      />
      {formik.errors.currentPassword && formik.touched.currentPassword && (
        <p className="text-red-400">{formik.errors.currentPassword}</p>
      )}
      <label htmlFor="password">كلمة المرور الجديدة:</label>
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
      <label htmlFor="passwordConfirm">تأكيد كلمة المرور الجديدة:</label>
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
      <button
        type="submit"
        disabled={formik.isSubmitting}
        className="p-3 mt-5 rounded-sm font-bold text-lg bg-gradient-to-b from-green-400 to-green-600"
      >
        {!formik.isSubmitting ? (
          "تغيير كلمة المرور"
        ) : (
          <FontAwesomeIcon
            icon={faCircleNotch}
            className="text-lg animate-spin"
          />
        )}
      </button>
    </form>
  );
}

export default ChangePasswordPage;
