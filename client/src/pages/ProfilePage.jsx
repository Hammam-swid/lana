import { Suspense } from "react";
import { Await, useLoaderData } from "react-router-dom";
import Post from "../components/Post";

function ProfilePage() {
  const dataPromise = useLoaderData();
  console.log(dataPromise);
  function renderUser(user, postsCount) {
    return (
      <div className="p-10">
        <div className="flex items-center justify-center  flex-col sm:gap-5 mb-10">
          <div className="w-32 h-32 rounded-full overflow-hidden">
            <img
              src={`http://localhost:3000/users/${user.photo}`}
              alt={`صورة ${user.fullName}`}
              crossOrigin="anonymous"
            />
          </div>
          <h1 className="text-3xl">{user.fullName}</h1>
        </div>
        <div className="flex justify-around max-w-[560px] mx-auto">
          <p>{`${postsCount} ${
            postsCount >= 3 && postsCount <= 10 ? "مناشير" : "منشور"
          }`}</p>
          |<p>{`يتابع ${user.following.length}`}</p>|
          <p>{`${user.followers.length} متابع`}</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <Suspense
        fallback={
          <div className="h-screen flex justify-center">
            <div className="w-20 h-20 border-8 border-white animate-spin border-r-green-500 rounded-full mt-20"></div>
          </div>
        }
      >
        <Await resolve={dataPromise.data}>
          {(data) => {
            console.log(data.user);
            console.log(data.posts);
            const showedPosts = data.posts.map((post) => (
              <Post key={post._id} post={post} />
            ));
            return (
              <>
                {renderUser(data.user, data.posts.length)}
                <div className="max-w-[560px] mx-auto">{showedPosts}</div>
              </>
            );
          }}
        </Await>
      </Suspense>
    </>
  );
}

export default ProfilePage;
