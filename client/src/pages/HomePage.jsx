import Post from "../components/Post";
import { Suspense } from "react";
import { useLoaderData, Await, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleNotch,
} from "@fortawesome/free-solid-svg-icons";

import PostForm from "../components/PostForm";

function HomePage() {
  // const [posts, setPosts] = useState([]);
  const promiseData = useLoaderData();

  return (
    <>
      <div className="max-w-[25rem] md:max-w-[30rem] w-full mx-auto mt-5 p-6">
        <PostForm />
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
