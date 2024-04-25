import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faImage,
  faPaperPlane,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import ImagePreview from "./ImagePreview";
import Message from "./Message";
import { useState } from "react";

function PostForm() {
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);
  const [imagePreview, setImagePreview] = useState([]);
  const [message, setMessage] = useState("");
  const formik = useFormik({
    initialValues: { content: "", images: [], video: "" },
    validationSchema: Yup.object({
      content: Yup.string().required("يجب أن يكون للمنشور محتوى نصي"),
    }),
    onSubmit: async (values) => {
      const { content, images } = values;
      try {
        const formData = new FormData();
        formData.append("content", content);
        for (let i = 0; i < images.length; i++)
          formData.append("images", images[i]);
        const res = await axios({
          method: "POST",
          url: "/api/v1/posts",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: formData,
        });
        console.log(res);
        setMessage("تم نشر المنشور بنجاح");
        setTimeout(setMessage, 3000, "");
        // setPosts((prevPosts) => prevPosts.unshift(res.data.post));
      } catch (error) {
        console.log(error);
      }
    },
  });
  function removeImages() {
    formik.values.images = [];
    setImagePreview([]);
    console.log(formik.values);
  }
  const name = user.fullName.split(" ");
  return (
    <form className="rounded-md overflow-hidden" onSubmit={formik.handleSubmit}>
      <div className="relative bg-green-200 dark:bg-slate-900 rounded-md pb-2">
        <div className="relative rounded-md">
          <textarea
            name="content"
            dir={/^[a-zA-Z]/.test(formik.values.content) ? "ltr" : "rtl"}
            spellCheck={false}
            value={formik.values.content}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={formik.isSubmitting}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) formik.submitForm();
            }}
            className={`${
              /^[a-zA-Z]/.test(formik.values.content) && "pl-10"
            } outline-none bg-slate-300 resize-none h-fit max-h-20 dark:bg-slate-800 w-full p-6 text-xl rounded-md`}
            placeholder={`بم تفكر يا ${
              user.fullName.startsWith("عبد")
                ? `${name[0]} ${name[1]}`
                : name[0]
            } ....؟`}
          />
          <button
            disabled={formik.isSubmitting || formik.values.content === ""}
            className="text-green-500 text-xl disabled:text-green-900 absolute top-1/2 -translate-y-1/2 end-2"
            type="submit"
          >
            {formik.isSubmitting ? (
              <FontAwesomeIcon
                icon={faCircleNotch}
                className="animate-spin text-green-500"
              />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} flip="horizontal" />
            )}
          </button>
        </div>
        <div className="flex flex-row-reverse gap-2 py-2 px-8 relative ">
          {imagePreview.length > 0 && (
            <>
              {imagePreview.map((image, index) => (
                <ImagePreview key={image} image={image} index={index} />
              ))}
              <button
                onClick={() => removeImages()}
                type="button"
                className="w-5 h-5 rounded-full flex justify-center items-center text-white dark:text-black bg-opacity-80 bg-gray-800 dark:bg-white absolute top-0 end-2"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <label htmlFor="image" className="cursor-pointer">
          <FontAwesomeIcon icon={faImage} className="text-green-500 text-2xl" />
        </label>
        <input
          type="file"
          className="hidden"
          name="images"
          multiple
          disabled={formik.isSubmitting}
          onChange={async (e) => {
            setImagePreview([]);
            const updateImages = async () => {
              for (let i = 0; i < formik.values.images.length; i++) {
                const reader = new FileReader();
                reader.onload = () => {
                  if (reader.readyState === 2) {
                    setImagePreview((prev) => [...prev, reader.result]);
                  }
                };
                reader.readAsDataURL(formik.values.images[i]);
              }
            };
            formik.values.images = e.target.files;
            await updateImages();
          }}
          onBlur={formik.handleBlur}
          // value={formik.values.images}
          id="image"
          accept="image/*"
        />
      </div>
      <Message message={message} show={message} />
    </form>
  );
}

export default PostForm;
