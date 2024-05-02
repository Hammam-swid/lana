import { faCircleNotch, faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFormik } from "formik";

function VerifyAccountPage() {
  const formik = useFormik({
    initialValues: {
      image: "",
    },
    onSubmit: (values) => console.log(values),
  });
  return (
    <form
      onSubmit={formik.handleSubmit}
      className="p-6 max-w-[40rem] mx-auto flex flex-col justify-center items-center h-full"
    >
      <input
        type="file"
        name="image"
        id="image"
        onChange={(e) => {
          formik.setFieldValue("image", e.target.files[0]);
        }}
        onBlur={formik.handleBlur}
        accept="image/*,.pdf"
        className="hidden"
      />
      <label htmlFor="image" className="text-3xl text-green-500 cursor-pointer">
        <FontAwesomeIcon icon={faImage} />
      </label>
      <button
        type="submit"
        className="bg-gradient-to-b from-green-400 to-green-600 w-full p-3 font-bold text-lg rounded-md"
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
