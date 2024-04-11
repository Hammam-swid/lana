import { Suspense, useState } from "react";
import { Await, useLoaderData, useParams } from "react-router-dom";
import Post from "../components/Post";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCheckCircle,
  faCircleNotch,
  faEllipsisV,
  faFlag,
  faTriangleExclamation,
  faUserSlash,
} from "@fortawesome/free-solid-svg-icons";
import { updateUser } from "../store/authSlice";

function ProfilePage() {
  const dataPromise = useLoaderData();
  const params = useParams();
  const thisUser = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const dispatch = useDispatch();
  const [profileOptions, setProfileOptions] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  function renderUser(user, posts) {
    if (
      thisUser.following?.find((follow) => {
        if (follow.username === user.username) {
          setIsFollowed(true);
          return true;
        }
        return false;
      })
    );
    else {
      setIsFollowed(false);
    }
    console.log(isFollowed);
    return (
      <div className="p-10">
        <div className="flex items-center justify-center  flex-col sm:gap-5 mb-10">
          <div>
            <img
              src={`/img/users/${user.photo}`}
              alt={`صورة ${user.fullName}`}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden object-cover"
            />
          </div>
          <div className="flex gap-5 items-end relative">
            <h1 className="text-3xl">
              {user.fullName}{" "}
              {user.verified && (
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-xl text-green-500"
                />
              )}
            </h1>
            {thisUser.username !== params.username && (
              <button onClick={() => setProfileOptions((prev) => !prev)}>
                <FontAwesomeIcon
                  icon={faEllipsisV}
                  className="text-2xl block"
                />
              </button>
            )}
            {profileOptions && (
              <ul className="w-52 rounded-md *:flex *:justify-between *:rounded-md *:items-center *:p-3 dark:hover:*:bg-slate-950 *:cursor-pointer dark:bg-slate-900 p-3 absolute -left-3 top-full mt-2">
                {thisUser.role === "user" ? (
                  <>
                    <li id="block-user">
                      <span>حظر الحساب</span>
                      <FontAwesomeIcon
                        icon={faBan}
                        flip="horizontal"
                        className="text-red-500"
                      />
                    </li>
                    <li>
                      <span>الإبلاغ عن الحساب</span>
                      <FontAwesomeIcon icon={faFlag} className="text-red-500" />
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <span>تحذير الحساب</span>
                      <FontAwesomeIcon
                        icon={faTriangleExclamation}
                        className="text-yellow-500"
                      />
                    </li>
                    <li>
                      <span>حظر الحساب نهائياً</span>
                      <FontAwesomeIcon
                        icon={faUserSlash}
                        flip="horizontal"
                        className="text-red-500"
                      />
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>
          {thisUser.username !== params.username && (
            <button
              onClick={async () => {
                try {
                  const res = await axios({
                    headers: { Authorization: `Bearer ${token}` },
                    url: `/api/v1/users/${user._id}/follow`,
                    method: isFollowed ? "DELETE" : "POST",
                  });
                  // console.log(res);
                  if (res.data.status === "success") {
                    console.log(res);
                    dispatch(updateUser({ user: res.data.user }));
                  }
                } catch (error) {
                  console.log(error);
                }
              }}
              className={`${
                isFollowed ? "bg-green-900" : "bg-green-500"
              } active:bg-green-300 text-xl px-3 py-1 rounded-full mt-5`}
            >
              {isFollowed ? "إلغاء المتابعة" : "متابعة"}
            </button>
          )}
        </div>
        <div className="flex justify-around max-w-[560px] mx-auto">
          <p>{`${posts.length} ${
            posts.length >= 3 && posts.length <= 10 ? "مناشير" : "منشور"
          }`}</p>
          |
          <p>
            {`${posts.reduce((prev, curr) => {
              return prev + curr.images?.length;
            }, 0)} صور`}
          </p>
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
          <div className="h-screen flex justify-center text-green-500 text-8xl">
            <FontAwesomeIcon
              icon={faCircleNotch}
              className="animate-spin mt-32"
            />
          </div>
        }
      >
        <Await resolve={dataPromise.data}>
          {(data) => {
            if (thisUser?.following?.includes(data.user)) {
              setIsFollowed(true);
            }
            const showedPosts = data.posts.map((post) => (
              <Post key={post._id} post={post} />
            ));
            return (
              <>
                {renderUser(data.user, data.posts)}
                <div className="w-full p-3 md:w-[38rem] mx-auto">
                  {showedPosts}
                </div>
              </>
            );
          }}
        </Await>
      </Suspense>
    </>
  );
}

export default ProfilePage;
