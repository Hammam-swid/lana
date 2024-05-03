/* eslint-disable react/prop-types */
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFormik } from "formik";
import { AnimatePresence, motion } from "framer-motion";

function WarningForm({ show }) {
  const formik = useFormik({
    initialValues: {
      type: "",
    },
    onSubmit: (values) => console.log(values),
  });
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ opacity: 0 }}
          className="fixed start-0 top-0 h-full w-full z-50 bg-black bg-opacity-60 flex justify-center items-center px-3"
        >
          <motion.form
            onSubmit={formik.handleSubmit}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="dark:bg-slate-900 bg-slate-100 p-6 rounded-md w-full max-w-[40rem] flex flex-col gap-3"
          >
            <h1 className="text-2xl text-center font-bold">
              <span>تحذير المستخدم</span>
              <FontAwesomeIcon
                icon={faWarning}
                className="text-yellow-500 ms-4 align-middle"
              />
            </h1>
            <label className="font-bold">النوع:</label>
            <div className="flex gap-3">
              <div>
                <input
                  type="radio"
                  id="post"
                  name="type"
                  value={"post"}
                  checked={formik.values.type === "post"}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="peer hidden"
                />
                <label
                  htmlFor="post"
                  className="peer-checked:font-bold py-2 cursor-pointer px-3 block bg-green-500 bg-opacity-20 peer-checked:bg-opacity-70 rounded-full duration-200"
                >
                  منشور
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="comment"
                  name="type"
                  value={"comment"}
                  checked={formik.values.type === "comment"}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="peer hidden"
                />
                <label
                  htmlFor="comment"
                  className="peer-checked:font-bold py-2 cursor-pointer px-3 block bg-green-500 bg-opacity-20 peer-checked:bg-opacity-70 rounded-full duration-200"
                >
                  تعليق
                </label>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WarningForm;
