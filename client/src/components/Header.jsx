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
} from "@fortawesome/free-solid-svg-icons";
import { setLogout } from "../store/authSlice";
import {
  useEffect,
  // useEffect,
  useState,
} from "react";
import NavBar from "./NavBar";
import MobileNavBar from "./MobileNavBar";
import Modal from "./Modal";

// eslint-disable-next-line react/prop-types
function Header({ notification }) {
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const [popup, setPopup] = useState(false);
  const [options, setOptions] = useState(false);
  const [notiList, setNotiList] = useState([]);
  const [showNotiList, setShowNotiList] = useState(false);
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
  }, [showNotiList]);
  const nav = useNavigate();
  const dispatch = useDispatch();
  // useEffect(() => {
  //   if (popup) {
  //     document.onscroll = (ev) => {
  //       ev.preventDefault();
  //     };
  //   } else {
  //     document.onscroll = undefined;
  //   }
  // }, [popup]);

  function updateOptions() {
    setOptions((prvOption) => !prvOption);
    setShowNotiList(false);
  }
  return (
    <>
      <header className=" min-h-20 w-screen sticky sm:top-0 bg-slate-100 shadow-md dark:bg-slate-900 z-50 flex justify-center sm:justify-between items-center py-2 px-6 sm:px-6 flex-wrap sm:flex-nowrap">
        <div className="flex justify-between relative items-center gap-5 w-full sm:w-fit mb-5 sm:mb-0">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <p className="text-3xl font-bold">لنا</p>
          </Link>
          <input
            type="text"
            name="search"
            id="search"
            className="p-2 rounded-md dark:bg-slate-800 outline-none focus:outline-2 focus:outline-green-500"
          />
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-2 text-2xl"
          />
        </div>

        <NavBar />
        <MobileNavBar options={options} updateOptions={updateOptions} />
        <div className="hidden items-center sm:gap-5 gap-10 relative sm:flex">
          <button
            onClick={() => {
              setShowNotiList((prev) => !prev);
              setOptions(false);
            }}
            className="relative p-1"
          >
            {notification && (
              <span className="absolute right-[0.5px] top-[0.5px] w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            )}
            <FontAwesomeIcon
              icon={faBell}
              className="text-2xl hover:text-green-500 duration-100"
            />
            {showNotiList &&
              (notiList ? (
                <div className="absolute flex flex-col gap-2 max-h-[35rem] top-full overflow-y-scroll p-3 rounded-md mt-8 -right-52 w-80 dark:bg-slate-900 cursor-default text-start">
                  {notiList.map((noti) => (
                    <Link
                      onClick={async () => {
                        try {
                          const res = axios({
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
                      className="p-2 dark:bg-slate-950 block rounded-md"
                      key={noti._id}
                    >
                      <p>
                        {new Date(noti.createdAt).toLocaleString("ar", {
                          day: "2-digit",
                          year: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </p>
                      <p className="flex justify-between items-center">
                        {noti.message}
                        <span
                          className={`block  ${
                            noti.type === "dislike" ||
                            noti.type === "deleteComment"
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
                </div>
              ) : (
                <div className="absolute top-full p-3 rounded-md mt-8 -right-52 w-80 dark:bg-slate-900 cursor-default text-start">
                  لا توجد إشعارات
                </div>
              ))}
          </button>
          <NavLink
            to={`/profile/${user.username}`}
            className={({ isActive }) =>
              `block rounded-full ${
                isActive ? "border-2 border-green-500" : ""
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
              options && "text-green-500 dark:bg-green-900"
            }`}
            onClick={updateOptions}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
        {options && (
          <ul
            onClick={() => setOptions(false)}
            className="absolute left-2 top-full sm:mt-[-10px] rounded-md bg-slate-100 dark:bg-slate-800 p-3 w-52 *:flex *:justify-between *:py-4 *:px-2 *:rounded-sm *:font-bold *:cursor-pointer dark:hover:*:bg-slate-900"
          >
            <li>
              <Link to={`settings/${user.username}`}>الإعدادات</Link>
              <FontAwesomeIcon
                className="text-2xl hover:text-green-500 duration-100 hover:animate-spin"
                icon={faGear}
              />
            </li>
            <li
              onClick={() => {
                setPopup(true);
              }}
            >
              <label>تسجيل الخروج</label>
              <FontAwesomeIcon
                className="text-2xl hover:text-red-500 duration-100"
                icon={faArrowRightFromBracket}
              />
            </li>
          </ul>
        )}
      </header>
      {popup && (
        <Modal
          action={() => {
            dispatch(setLogout());
            nav("/login");
          }}
          message="هل أنت متأكد من أنك تريد تسجيل الخروج؟"
          hide={() => setPopup(false)}
        />
      )}
    </>
  );
}

export default Header;
