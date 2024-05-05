import { faCircleNotch, faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFormik } from "formik";

function VerifyAccountPage() {
  const formik = useFormik({
    initialValues: {
      verificationFile: "",
      description: "",
    },
    onSubmit: (values) => console.log(values),
  });
  return (
    <form
      onSubmit={formik.handleSubmit}
      className="p-6 max-w-[40rem] mx-auto flex flex-col justify-center gap-5 h-full"
    >
      <p className="font-bold">ملف التوثيق:</p>
      <input
        type="file"
        name="verificationFile"
        id="verificationFile"
        onChange={(e) => {
          formik.setFieldValue("verificationFile", e.target.files[0]);
        }}
        onBlur={formik.handleBlur}
        accept="image/*,.pdf"
        className=""
      />
      <p className="text-gray-500">يمكنك رفع صورة أو ملف pdf</p>
      {/* <label htmlFor="verificationFile" className="text-3xl text-green-500 cursor-pointer">
        <FontAwesomeIcon icon={faImage} />
      </label> */}
      <label htmlFor="description" className="font-bold">
        الوصف:
      </label>
      <textarea
        name="description"
        id="description"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.description}
        className="resize-none rounded-md h-20 p-3 outline outline-2 focus:outline-green-500 outline-green-800 dark:bg-slate-900"
      />
      <button
        disabled={formik.isSubmitting}
        type="submit"
        className="mt-8 bg-gradient-to-b from-green-400 to-green-600 w-full p-3 font-bold text-lg rounded-md"
      >
        {formik.isSubmitting ? (
          <FontAwesomeIcon
            icon={faCircleNotch}
            className="animate-spin text-green-100"
          />
        ) : (
          "إرسال"
        )}
      </button>
    </form>
  );
}

export default VerifyAccountPage;
