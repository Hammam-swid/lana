import { Suspense, useState } from "react";
import { Await, Link, useLoaderData } from "react-router-dom";
import Post from "../components/Post";

function SearchPage() {
  const promiseData = useLoaderData();
  const [showList, setShowList] = useState("posts");
  return (
    <div className="sm:w-[35rem] md:w-[40rem] mx-auto p-3 md:p-6">
      <button
        className={`px-2 py-1  rounded-md bg-slate-100 dark:bg-slate-900 me-5 ${
          showList === "posts" ? "font-bold text-green-500 underline" : ""
        } `}
        onClick={() => setShowList("posts")}
      >
        المناشير
      </button>
      <button
        className={`px-2 py-1  rounded-md bg-slate-100 dark:bg-slate-900 ${
          showList === "users" ? "font-bold text-green-500 underline" : ""
        } `}
        onClick={() => setShowList("users")}
      >
        الحسابات
      </button>
      {showList === "posts" ? (
        <div>
          <Suspense fallback={<>جار التحميل</>}>
            <Await resolve={promiseData.data}>
              {(data) =>
                data.posts.length > 0 ? (
                  data.posts.map((post) => <Post key={post._id} post={post} />)
                ) : (
                  <div className="text-gray-500 mt-10 p-3">لا توجد نتائج</div>
                )
              }
            </Await>
          </Suspense>
        </div>
      ) : (
        <div className="flex flex-col gap-5 p-3">
          <Suspense fallback={<>جار التحميل</>}>
            <Await resolve={promiseData.data}>
              {(data) =>
                data.users.length > 0 ? (
                  data.users.map((user) => (
                    <Link
                      to={`/profile/${user.username}`}
                      key={user._id}
                      className="flex p-2 rounded-md items-center gap-2 bg-slate-100 dark:bg-slate-900"
                    >
                      <img
                        src={`/img/users/${user.photo}`}
                        alt={`صورة ${user.fullName}`}
                        className="w-8 h-8 object-cover rounded-full"
                      />
                      <div>
                        <h4>{user.fullName}</h4>
                        <p dir="ltr" className="text-right text-gray-500">
                          @{user.username}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-gray-500 mt-10">لا توجد نتائج</div>
                )
              }
            </Await>
          </Suspense>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
