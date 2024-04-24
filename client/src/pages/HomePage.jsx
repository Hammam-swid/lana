import Post from "../components/Post";
import { Suspense, useState } from "react";
import { useSelector } from "react-redux";
import { useLoaderData, Await, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleNotch,
  faImage,
  faPaperPlane,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useFormik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import ImagePreview from "../components/ImagePreview";
import Message from "../components/Message";

function HomePage() {
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  // const [posts, setPosts] = useState([]);
  const promiseData = useLoaderData();
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
  // function removePost(postId) {
  //   setPosts((prevPosts) =>
  //     prevPosts.filter((post) => {
  //       console.log(post._id !== postId);
  //       return post._id !== postId;
  //     })
  //   );
  // }
  // function addPost(post) {
  //   setPosts((prevPosts) => prevPosts.unshift(post));
  // }
  function removeImages() {
    formik.values.images = [];
    setImagePreview([]);
    console.log(formik.values);
  }
  const name = user.fullName.split(" ");
  return (
    <>
      <div className="max-w-[25rem] md:max-w-[30rem] w-full mx-auto mt-5 p-6">
        <form
          className="rounded-md overflow-hidden"
          onSubmit={formik.handleSubmit}
        >
          <div className="relative bg-green-200 dark:bg-slate-900 rounded-md pb-2">
            <div className="relative rounded-md">
              <textarea
                name="content"
                dir={/^[a-zA-Z]/.test(formik.values.content) ? "ltr" : "rtl"}
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
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    flip="horizontal"
                    rotation={45}
                  />
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
      </div>
      <div className="flex flex-col md:flex-row-reverse gap-5 items-center md:items-start bg-slate-200 dark:bg-slate-950">
        <div className="md:w-1/3 p-6 md:mt-[-120px] self-start sm:self-center w-full overflow-x-scroll md:self-start">
          <h2 className="font-bold text-3xl mb-5">المتابَعون</h2>
          <ul className="flex gap-7 overflow-x-scroll  md:flex-col">
            <Suspense
              fallback={
                <div className="text-center">
                  <FontAwesomeIcon
                    icon={faCircleNotch}
                    className="text-green-500 animate-spin"
                  />
                </div>
              }
            >
              <Await resolve={promiseData.followingUsers}>
                {(following) => {
                  return following.length > 0 ? (
                    following.map((follower) => (
                      <li key={follower.username}>
                        <Link
                          to={`/profile/${follower.username}`}
                          className="flex items-center gap-2 flex-col md:flex-row shrink-0"
                        >
                          <div>
                            <img
                              src={`/img/users/${follower.photo}`}
                              alt={`صورة ${follower.fullName}`}
                              className="min-w-16 min-h-16 max-w-16 max-h-16 rounded-full overflow-hidden object-center"
                            />
                          </div>
                          <p className="text-center font-bold text-nowrap">
                            {follower.fullName}{" "}
                            {follower.verified && (
                              <span className="inline-block text-green-500">
                                {" "}
                                <FontAwesomeIcon icon={faCircleCheck} />{" "}
                              </span>
                            )}
                          </p>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <h3 className="text-gray-500">أنت لا تتابع أحداً</h3>
                  );
                }}
              </Await>
            </Suspense>
          </ul>
        </div>
        <main className="w-screen sm:w-2/3 xl:w-[45rem] bg-slate-200 dark:bg-slate-950 p-3">
          <Suspense
            fallback={
              <div className="h-screen flex justify-center text-green-500 text-8xl">
                <FontAwesomeIcon
                  icon={faCircleNotch}
                  className="animate-spin"
                />
              </div>
            }
          >
            <Await resolve={promiseData.posts}>
              {(data) => {
                // setPosts(data);
                return data.map((post) => <Post key={post._id} post={post} />);
              }}
            </Await>
          </Suspense>
        </main>
        <div className="md:w-1/3"></div>
      </div>
    </>
  );
}

export default HomePage;
