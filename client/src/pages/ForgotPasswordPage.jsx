import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

function ForgotPasswordPage() {
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .required("يجب إدخال البريد الإلكتروني")
        .email("الرجاء إدخال البريد الإلكتروني بشكل صحيح"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await axios({
          method: "POST",
          url: "/api/v1/users/forgotPassword",
          data: values,
        });
        console.log(res);
      } catch (error) {
        console.log(error);
      }
    },
  });
  return (
    <div className="flex-grow flex justify-center items-center px-5">
      <form className="w-full max-w-96 flex flex-col gap-3" onSubmit={formik.handleSubmit}>
        <h1 className="text-2xl font-bold mb-8 text-center">نسيتَ كلمة المرور؟</h1>
        <label htmlFor="email">البريد الإلكتروني: </label>
        <input
          type="email"
          name="email"
          id="email"
          dir="ltr"
          placeholder="example@email.com"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.email}
          className="border-green-500 outline-none border-2 p-3 rounded-lg dark:bg-slate-900 dark:text-green-100 invalid:border-red-400 peer"
        />
        {formik.errors.email && formik.touched.email && (
          <p className="text-red-400">{formik.errors.email}</p>
        )}
        <button
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
    </div>
  );
}

export default ForgotPasswordPage;
