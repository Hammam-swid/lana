import { Suspense } from "react";
import { Await, Link, useLoaderData } from "react-router-dom";
import Post from "../components/Post";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
function PostPage() {
  const promiseData = useLoaderData();
  return (
    <div className="md:w-[40rem] mx-auto mt-5">
      <Link
        to=".."
        className="p-3 text-xl bg-green-500 flex w-fit items-center justify-center rounded-md"
      >
        <FontAwesomeIcon icon={faArrowRight} />
      </Link>
      <Suspense
        fallback={
          <div className="h-screen flex justify-center text-green-500 text-8xl">
            <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
          </div>
        }
      >
        <Await resolve={promiseData.post}>
          {(post) => <Post post={post} />}
        </Await>
      </Suspense>
    </div>
  );
}

export default PostPage;
