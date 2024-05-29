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
  faUserMinus,
  faUserPlus,
  faUserSlash,
} from "@fortawesome/free-solid-svg-icons";
import { updateUser } from "../store/authSlice";
import Modal from "../components/Modal";
import Message from "../components/Message";
import { AnimatePresence, motion } from "framer-motion";
import ReportModal from "../components/ReportModal";
import WarningForm from "../components/WarningForm";

function ProfilePage() {
  const dataPromise = useLoaderData();
  const params = useParams();
  const thisUser = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const dispatch = useDispatch();
  const [profileOptions, setProfileOptions] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [modalData, setModalData] = useState({});
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  let userId;
  function renderUser(user, posts) {
    userId = user._id;
    console.log(thisUser.following);
    if (
      thisUser.following?.some((follow) => {
        if (follow === user._id) {
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
      <>
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
              <AnimatePresence>
                {profileOptions && (
                  <motion.ul
                    animate={{ y: 0, scale: 1, originX: 0, originY: 0 }}
                    initial={{ scale: 0, y: -10 }}
                    exit={{ scale: 0, y: -10 }}
                    className="w-52 rounded-md *:flex *:justify-between *:rounded-md *:items-center *:p-3 bg-slate-50 *:duration-200 dark:hover:*:bg-slate-950 hover:*:bg-green-200 *:cursor-pointer dark:bg-slate-900 p-3 absolute z-30 -left-3 top-full mt-2"
                  >
                    {thisUser.role === "user" ? (
                      <>
                        <li
                          onClick={() => {
                            setModalData({
                              message:
                                "هل أنت متأكد من أنك تريد حظر هذا المستخدم؟",
                              hide: () => setModalData({}),
                              action: async () => {
                                try {
                                  console.log(user._id);
                                  const res = await axios({
                                    method: "POST",
                                    url: `/api/v1/users/${user._id}/block`,
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  });
                                  console.log(res)
                                  if (res.status === 200) {
                                    setMessage("تم حظر هذا المستخدم بنجاح");
                                    setTimeout(setMessage, 3000, "");
                                  }
                                } catch (error) {
                                  console.log(error);
                                }
                              },
                            });
                          }}
                          id="block-user"
                        >
                          <span>حظر الحساب</span>
                          <FontAwesomeIcon
                            icon={faBan}
                            flip="horizontal"
                            className="text-red-500"
                          />
                        </li>
                        <li onClick={() => setShowReport(true)}>
                          <span>الإبلاغ عن الحساب</span>
                          <FontAwesomeIcon
                            icon={faFlag}
                            className="text-red-500"
                          />
                        </li>
                      </>
                    ) : (
                      <>
                        <li onClick={() => setShowWarning(true)}>
                          <span>تحذير الحساب</span>
                          <FontAwesomeIcon
                            icon={faTriangleExclamation}
                            className="text-yellow-500"
                          />
                        </li>
                        <li
                          onClick={() =>
                            setModalData({
                              message:
                                "هل أنت متأكد من أنك تريد حظر هذا الحساب؟",
                              hide: () => setModalData({}),
                              action: async () => {
                                try {
                                  const res = await axios({
                                    method: "PATCH",
                                    url: `/api/v1/users/${user._id}/ban`,
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  });
                                  if (res.status === 204) {
                                    setMessage("تم حظر هذا المستخدم");
                                    setTimeout(setMessage, 3000, false);
                                    setModalData({});
                                  }
                                } catch (error) {
                                  console.log(error);
                                }
                              },
                            })
                          }
                        >
                          <span>حظر الحساب نهائياً</span>
                          <FontAwesomeIcon
                            icon={faUserSlash}
                            flip="horizontal"
                            className="text-red-500"
                          />
                        </li>
                      </>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
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
                    setErrorMessage(error?.response?.data?.message);
                    setTimeout(setErrorMessage, 3000, "");
                  }
                }}
                className={`${
                  isFollowed ? "bg-green-900" : "bg-green-500"
                } active:bg-green-300 text-xl px-3 py-1 rounded-full mt-5`}
              >
                {isFollowed ? "إلغاء المتابعة" : "متابعة"}
                <FontAwesomeIcon
                  icon={!isFollowed ? faUserPlus : faUserMinus}
                  flip="horizontal"
                  className="ms-2"
                />
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
        <Message message={message || errorMessage} error={errorMessage} />
        <Modal
          message={modalData.message}
          action={modalData.action}
          hide={modalData.hide}
        />
        <ReportModal
          show={showReport}
          hide={() => setShowReport(false)}
          reportedUser={userId}
        />
        <WarningForm
          show={showWarning}
          hide={() => setShowWarning(false)}
          userId={userId}
        />
      </>
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
            const showedPosts =
              data.posts.length > 0 ? (
                data.posts.map((post) => <Post key={post._id} post={post} />)
              ) : (
                <div className="text-xl text-center text-gray-500">
                  لا توجد مناشير
                </div>
              );
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
