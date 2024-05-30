import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import {
  faArrowRightFromBracket,
  faMagnifyingGlass,
  faBell,
  faBars,
  faGear,
  faThumbsUp,
  faThumbsDown,
  faCheck,
  faMessage,
  faCommentSlash,
  faUserPlus,
  faMoon,
  faCircleNotch,
  faToolbox,
  faFlag,
} from "@fortawesome/free-solid-svg-icons";
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons";
import { setLogout, updateTheme } from "../store/authSlice";
import {
  useEffect,
  useRef,
  // useEffect,
  useState,
} from "react";
import NavBar from "./NavBar";
import MobileNavBar from "./MobileNavBar";
import Modal from "./Modal";
import SearchSuggestions from "./SearchSuggestions";
import { AnimatePresence, motion } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";

// eslint-disable-next-line react/prop-types
function Header({ notification }) {
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const theme = useSelector((state) => state.theme);
  const [modalData, setModalData] = useState({});
  const [options, setOptions] = useState(false);
  const [notiList, setNotiList] = useState([]);
  const [showNotiList, setShowNotiList] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const getNotiList = async () => {
      try {
        const res = await axios({
          method: "GET",
          url: "/api/v1/notifications",
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotiList(res.data.notifications);
      } catch (error) {
        console.log(error);
      }
    };
    getNotiList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNotiList, notification]);
  const isNotified = notiList.filter((noti) => !noti.seen).length;
  const nav = useNavigate();
  const dispatch = useDispatch();
  function updateOptions() {
    setOptions((prvOption) => !prvOption);
    setShowNotiList(false);
  }
  const formik = useFormik({
    initialValues: {
      search: "",
    },
    validationSchema: Yup.object({
      search: Yup.string().required(""),
    }),
    onSubmit: async (values) => {
      const { search } = values;
      nav(`/search?search=${search}`, { preventScrollReset: false });
      ref.current.blur();
    },
  });
  return (
    <>
      <header className="min-h-20 w-screen sticky sm:top-0 bg-slate-100 shadow-md dark:bg-slate-900 z-50 flex justify-center sm:justify-between items-center py-2 px-6 sm:px-6 flex-wrap sm:flex-nowrap">
        <div className="flex  justify-between relative items-center gap-5 w-full sm:w-fit mb-5 sm:mb-0">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              className="w-20 h-14"
              src={
                theme === "dark"
                  ? "/src/assets/darkLanaLogo.svg"
                  : "/src/assets/lanaLogo.svg"
              }
              alt="شعار منصة لنا"
            />
          </Link>
          <form className="relative py-1" onSubmit={formik.handleSubmit}>
            <input
              type="text"
              name="search"
              id="search"
              autoSave={""}
              ref={ref}
              placeholder="أدخل للبحث"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.search}
              className="peer p-2 duration-100 rounded-md shrink grow-0 bg-slate-200 dark:bg-slate-800 outline-none focus:outline-3 focus:outline-green-500"
            />
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="absolute left-2 text-2xl"
            >
              {formik.isSubmitting ? (
                <FontAwesomeIcon
                  icon={faCircleNotch}
                  className="text-green-500 animate-spin"
                />
              ) : (
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              )}
            </button>
            <SearchSuggestions
              value={formik.values.search}
              removeValue={() => {
                formik.setValues({ search: "" });
              }}
            />
          </form>
        </div>

        <NavBar />
        <MobileNavBar
          options={options}
          updateOptions={updateOptions}
          notification={isNotified}
        />
        <div className="hidden items-center sm:w-56 sm:gap-5 gap-10 relative sm:flex sm:justify-end">
          <button
            onClick={() => {
              setShowNotiList((prev) => !prev);
              setOptions(false);
            }}
            className="relative pt-1"
          >
            {isNotified > 0 && (
              <span className="absolute right-[0.5px] top-[0.5px] w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            )}
            <FontAwesomeIcon
              icon={faBell}
              className="text-2xl hover:text-green-500 duration-100"
            />
            {showNotiList &&
              (notiList.length > 0 ? (
                <motion.div
                  animate={{ y: 0 }}
                  initial={{ y: -100 }}
                  dir="rtl"
                  className="absolute bg-slate-50 flex flex-col gap-2 max-h-[35rem] top-full overflow-y-scroll p-3 rounded-md mt-8 -right-52 w-80 dark:bg-slate-900 cursor-default text-start"
                >
                  <button
                    onClick={async () => {
                      try {
                        const res = await axios({
                          method: "PATCH",
                          url: "/api/v1/notifications",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        console.log(res);
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                    className="p-2 duration-200 rounded-md dark:hover:bg-green-900 hover:bg-green-200 flex justify-center items-center gap-2"
                  >
                    <span>تعليم الكل كمقروء</span>
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  {notiList.map((noti) => (
                    <Link
                      onClick={async () => {
                        try {
                          const res = await axios({
                            method: "PATCH",
                            url: `/api/v1/notifications/${noti._id}`,
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          console.log(res);
                        } catch (error) {
                          console.log(error);
                        }
                      }}
                      to={noti.returnUrl}
                      className={`p-2 bg-slate-200 dark:bg-slate-950 block rounded-md ${
                        noti.seen ? "text-gray-500" : "font-bold"
                      }`}
                      key={noti._id}
                    >
                      <p>
                        {new Date(noti.createdAt).toLocaleString("ar", {
                          day: "2-digit",
                          year: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="flex justify-between items-center">
                        {noti.message}
                        <span
                          className={`block text-white ${
                            noti.type === "dislike" ||
                            noti.type === "deleteComment" ||
                            noti.type === "verifyingRejected"
                              ? "bg-red-500"
                              : "bg-green-500"
                          } rounded-full px-2 py-1`}
                        >
                          {noti.type === "like" ? (
                            <FontAwesomeIcon icon={faThumbsUp} />
                          ) : noti.type === "dislike" ? (
                            <FontAwesomeIcon icon={faThumbsDown} />
                          ) : noti.type === "comment" ? (
                            <FontAwesomeIcon icon={faMessage} />
                          ) : noti.type === "deleteComment" ? (
                            <FontAwesomeIcon icon={faCommentSlash} />
                          ) : noti.type === "follow" ? (
                            <FontAwesomeIcon icon={faUserPlus} />
                          ) : noti.type === "report" ? (
                            <FontAwesomeIcon icon={faFlag} />
                          ) : noti.type.startsWith("verifying") ? (
                            <FontAwesomeIcon icon={faCheckCircle} />
                          ) : (
                            ""
                          )}
                        </span>
                      </p>
                      <p>
                        <FontAwesomeIcon
                          icon={faCheck}
                          className={`${
                            noti.seen ? "text-green-500" : "text-gray-500"
                          }`}
                        />{" "}
                      </p>
                    </Link>
                  ))}
                </motion.div>
              ) : (
                <div className="absolute text-gray-500 text-center bg-slate-50 top-full p-3 rounded-md mt-8 -right-52 w-80 dark:bg-slate-900 cursor-default">
                  لا توجد إشعارات
                </div>
              ))}
          </button>
          <button
            className="text-2xl hover:text-green-500 duration-100"
            onClick={() => {
              dispatch(
                updateTheme({ theme: theme === "light" ? "dark" : "light" })
              );
            }}
          >
            {theme === "dark" ? (
              <FontAwesomeIcon icon={faMoon} />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
          <NavLink
            to={`/profile/${user.username}`}
            className={({ isActive }) =>
              `block shrink-0 rounded-full ${
                isActive ? "outline outline-2 outline-green-500" : ""
              } `
            }
          >
            <img
              className="w-8 h-8 rounded-full overflow-hidden object-cover"
              src={`/img/users/${user.photo}`}
              alt={`صورة ${user.fullName}`}
            />
          </NavLink>
          <button
            className={`text-2xl hover:text-green-500 duration-100 px-2 rounded ${
              options && "text-green-500 bg-green-100 dark:bg-green-900"
            }`}
            onClick={updateOptions}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
        <AnimatePresence>
          {options && (
            <motion.div
              animate={{ scaleY: 1, y: 0 }}
              initial={{ scaleY: 0, y: -100 }}
              exit={{ scale: 0, originY: 0, originX: 0.2, y: -50 }}
              onClick={() => setOptions(false)}
              className="absolute left-2 top-full sm:mt-[-10px] rounded-md bg-slate-100 dark:bg-slate-800 p-3 w-52 *:flex *:justify-between *:py-4 *:px-2 *:rounded-md *:font-bold *:cursor-pointer dark:hover:*:bg-slate-900 hover:*:bg-green-200"
            >
              {(user.role === "moderator" || user.role === "admin") && (
                <Link to={"dashboard"}>
                  <span>لوحة التحكم</span>
                  <FontAwesomeIcon
                    className="text-2xl hover:text-green-500 "
                    icon={faToolbox}
                  />
                </Link>
              )}
              <Link to={`settings/${user.username}`}>
                <span>الإعدادات</span>
                <FontAwesomeIcon
                  className="text-2xl hover:text-green-500 duration-100 hover:animate-spin"
                  icon={faGear}
                />
              </Link>
              <div
                className="cursor-pointer"
                onClick={() => {
                  setModalData({
                    message: "هل أنت متأكد من أنك تريد تسجيل الخروج؟",
                    hide: () => setModalData({}),
                    action: async () => {
                      try {
                        const res = await axios({
                          method: "GET",
                          url: "/api/v1/users/logout",
                        });
                        if (res.status === 200) {
                          dispatch(setLogout());
                          nav("/login");
                        }
                      } catch (error) {
                        console.log(error);
                      }
                    },
                  });
                }}
              >
                <label className="cursor-pointer">تسجيل الخروج</label>
                <FontAwesomeIcon
                  className="text-2xl hover:text-red-500 duration-100"
                  icon={faArrowRightFromBracket}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <Modal
        action={modalData.action}
        message={modalData.message}
        hide={modalData.hide}
      />
    </>
  );
}

export default Header;
