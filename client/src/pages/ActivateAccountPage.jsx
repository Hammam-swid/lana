import { useFormik } from "formik";

function ActivateAccountPage() {
  const formik = useFormik({
    initialValues: {
      email: "",
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <input type="email" name="email" id="email" />
      <button type="submit">إرسال</button>
    </form>
  );
}

export default ActivateAccountPage;
