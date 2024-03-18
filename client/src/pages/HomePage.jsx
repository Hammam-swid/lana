import Post from "../components/Post";
import { Suspense, useState } from "react";
import { useSelector } from "react-redux";
import { useLoaderData, Await } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
function HomePage() {
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const promisePosts = useLoaderData();
  const [formData, setFormData] = useState({});
  const name = user.fullName.split(" ");
  // useEffect(, []);
  function handleChange(element) {
    setFormData((prevData) => ({
      ...prevData,
      [element.name]: element.name === "images" ? element.files : element.value,
    }));
  }
  return (
    <>
      <div className="max-w-[560px] mx-auto mt-5 p-6">
        <form
          className="rounded-md overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault();
            const createPost = async () => {
              try {
                const data = new FormData();
                data.append("content", formData.content);
                for (let image in e.target.elements.images.files)
                  data.append("images", image);
                const res = await axios({
                  url: `http://localhost:3000/api/v1/posts`,
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                  data,
                });
                if (res.data.status === "success") {
                  console.log("post created");
                }
              } catch (err) {
                console.log(err);
              }
            };
            createPost();
          }}
        >
          <input
            type="text"
            name="content"
            value={formData.content}
            onChange={(e) => handleChange(e.target)}
            multiple
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
              onChange={(e) => handleChange(e.target)}
              value={formData.image}
              id="image"
              accept=".png,.jpg,.bmp"
            />
          </div>
          <button>ارسال</button>
        </form>
      </div>
      <div className="flex flex-col sm:flex-row-reverse gap-5 bg-slate-200 dark:bg-slate-950">
        <div className="md:w-1/3 p-6">
          <h2 className="font-bold text-3xl mb-5">المتابَعون</h2>
          <ul>
            {user.following.length > 0 ? (
              user.following.map((follower) => (
                <li key={follower.username}>
                  <h1>{follower.fullName}</h1>
                </li>
              ))
            ) : (
              <h3 className="text-gray-500">أنت لا تتابع أحداً</h3>
            )}
          </ul>
        </div>
        <main className="sm:w-1/2 md:w-2/5 bg-slate-200 dark:bg-slate-950 p-3">
          <Suspense
            fallback={
              <div className="h-screen flex justify-center">
                <div className="w-20 h-20 border-8 border-white animate-spin border-r-green-500 rounded-full mt-20"></div>
              </div>
            }
          >
            <Await resolve={promisePosts.posts}>
              {(posts) =>
                posts.map((post) => <Post key={post._id} post={post} />)
              }
            </Await>
          </Suspense>
        </main>
        <div className="md:w-1/3"></div>
      </div>
    </>
  );
}

export default HomePage;
