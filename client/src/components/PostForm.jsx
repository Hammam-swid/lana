import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faImage,
  faPaperPlane,
  faVideo,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import ImagePreview from "./ImagePreview";
import Message from "./Message";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function PostForm() {
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);
  const [imagePreview, setImagePreview] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const nav = useNavigate();
  const formik = useFormik({
    initialValues: { content: "", images: [], video: "" },
    validationSchema: Yup.object({
      content: Yup.string().required("يجب أن يكون للمنشور محتوى نصي"),
    }),
    onSubmit: async (values, helpers) => {
      const { content, images, video } = values;
      try {
        console.log(video);
        const formData = new FormData();
        formData.append("content", content);
        console.log(images[0]);
        for (let i = 0; i < images.length; i++)
          formData.append("images", images[i]);
        if (video) formData.append("video", video);
        console.log(formData, images);
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
        nav(".", { replace: true });
        removeImages();
        helpers.setValues({ video: "", content: "", images: [] });
        // setPosts((prevPosts) => prevPosts.unshift(res.data.post));
      } catch (error) {
        console.log(error);
      }
    },
  });
  function removeImages() {
    formik.values.images = [];
    formik.values.video = "";
    setImagePreview([]);
    setVideoPreview(null);
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
        <div className="flex flex-row-reverse gap-2 px-8 relative ">
          {imagePreview.length > 0 ? (
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
          ) : (
            videoPreview && (
              <>
                <video
                  autoPlay={false}
                  className="rounded-md h-12"
                  onLoadedMetadata={(e) => {
                    if (e.target.duration >= 61) {
                      setMessage("لا يمكنك رفع فيديو بطول أطول من دقيقة");
                      setMessageError(true);
                      setTimeout(() => {
                        setMessage("");
                        setMessageError(false);
                      }, 3000);
                      removeImages();
                    }
                  }}
                >
                  <source src={URL.createObjectURL(videoPreview)} />
                </video>
                <button
                  onClick={() => removeImages()}
                  type="button"
                  className="w-5 h-5 rounded-full flex justify-center items-center text-white dark:text-black bg-opacity-80 bg-gray-800 dark:bg-white absolute top-0 end-2"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </>
            )
          )}
        </div>
        <div className="flex justify-end px-2">
          <label htmlFor="images" className="cursor-pointer">
            <FontAwesomeIcon
              icon={faImage}
              className="text-green-500 text-2xl"
            />
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
                  console.log(formik.values.images);
                  reader.readAsDataURL(formik.values.images[i]);
                }
              };
              console.log(e.target.files);
              formik.values.images = e.target.files;
              await updateImages();
            }}
            onBlur={formik.handleBlur}
            // value={""}
            id="images"
            accept="image/*"
          />
          <label htmlFor="video" className="cursor-pointer">
            <FontAwesomeIcon
              icon={faVideo}
              className="text-green-500 text-2xl ms-3"
            />
          </label>
          <input
            type="file"
            name="video"
            id="video"
            className="hidden"
            accept="video/mp4"
            value={""}
            onChange={(e) => {
              // const reader = new FileReader();
              // reader.onload = (event) => {};
              console.log(e.target.files[0].name);
              setVideoPreview(e.target.files[0]);
              formik.values.video = e.target.files[0];
            }}
          />
        </div>
      </div>
      <Message message={message} error={messageError} />
    </form>
  );
}

export default PostForm;
