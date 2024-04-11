import Post from "../components/Post";
import {
  Suspense,
  // useState
} from "react";
import { useSelector } from "react-redux";
import { useLoaderData, Await, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faImage,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { useFormik } from "formik";
import axios from "axios";
import * as Yup from "yup";

function HomePage() {
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  // const [posts, setPosts] = useState([]);
  const promiseData = useLoaderData();
  const formik = useFormik({
    initialValues: { content: "", images: [], video: "" },
    validationSchema: Yup.object({
      content: Yup.string().required("يجب أن يكون للمنشور محتوى نصي"),
    }),
    onSubmit: async (values) => {
      console.log(values);
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
  const name = user.fullName.split(" ");
  return (
    <>
      <div className="max-w-[30rem] mx-auto mt-5 p-6">
        <form
          className="rounded-md overflow-hidden"
          onSubmit={formik.handleSubmit}
        >
          <input
            type="text"
            name="content"
            value={formik.values.content}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={formik.isSubmitting}
            className="outline-none bg-slate-300 dark:bg-slate-800 w-full p-6 text-xl rounded-md"
            placeholder={`بم تفكر يا ${
              name.length === 3 ? `${name[0]} ${name[1]}` : name[0]
            } ....؟`}
          />
          <div>
            <label htmlFor="image" className="cursor-pointer">
              <FontAwesomeIcon
                icon={faImage}
                className="text-green-500 text-2xl"
              />
              صورة
            </label>
            <input
              type="file"
              className="hidden"
              name="images"
              multiple
              disabled={formik.isSubmitting}
              onChange={(e) => {
                console.log(formik.errors);
                formik.setFieldValue("images", e.target.files);
              }}
              onBlur={formik.handleBlur}
              // value={formik.values.images}
              id="image"
              accept="image/*"
            />
          </div>
          <button
            disabled={formik.isSubmitting}
            className="text-green-500 text-xl absolute"
            type="submit"
          >
            {formik.isSubmitting ? (
              <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} flip="horizontal" />
            )}
          </button>
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
                  console.log(following);
                  return following.length > 0 ? (
                    following.map((follower) => (
                      <li key={follower.username}>
                        <Link
                          to={`/profile/${follower.username}`}
                          className="flex items-center gap-2 flex-col md:flex-row"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img
                              src={`/img/users/${follower.photo}`}
                              alt={`صورة ${follower.fullName}`}
                            />
                          </div>
                          <p className="text-center font-bold">
                            {follower.fullName}
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
            {/* {user.following.length > 0 ? (
              user.following.map((follower) => (
                <li key={follower.username}>
                  <Link
                    to={`/profile/${follower.username}`}
                    className="flex items-center gap-2 flex-col md:flex-row"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={`/img/users/${follower.photo}`}
                        alt={`صورة ${follower.fullName}`}
                      />
                    </div>
                    <p className="text-center font-bold">{follower.fullName}</p>
                  </Link>
                </li>
              ))
            ) : (
              <h3 className="text-gray-500">أنت لا تتابع أحداً</h3>
            )} */}
          </ul>
        </div>
        <main className="sm:w-2/3 xl:w-[45rem] bg-slate-200 dark:bg-slate-950 p-3">
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
