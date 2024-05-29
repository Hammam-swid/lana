import { Suspense } from "react";
import { Await, useLoaderData } from "react-router-dom";
import Post from "../components/Post";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

function TrendingPage() {
  const promiseData = useLoaderData();
  return (
    <div className="max-w-[40rem] mx-auto">
      <Suspense
        fallback={
          <div className="h-screen flex justify-center text-green-500 text-7xl mt-14">
            <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
          </div>
        }
      >
        <Await resolve={promiseData.posts}>
          {(posts) =>
            posts.length > 0 ? (
              posts.map((post) => <Post key={post._id} post={post} />)
            ) : (
              <div className="text-2xl mt-16 text-gray-500">لا يوجد محتوى رائج</div>
            )
          }
        </Await>
      </Suspense>
    </div>
  );
}

export default TrendingPage;
