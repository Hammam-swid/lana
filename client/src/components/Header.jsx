import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faFire,
  faArrowRightFromBracket,
  faMagnifyingGlass,
  faBell,
  faBars,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { setLogout } from "../store/authSlice";
import { useEffect, useState } from "react";

// eslint-disable-next-line react/prop-types
function Header({ notification }) {
  const user = useSelector((state) => state.user);
  const [popup, setPopup] = useState(false);
  const [options, setOptions] = useState(false);
  const nav = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    if (popup) {
      document.onscroll = (ev) => {
        ev.preventDefault();
      };
    } else {
      document.onscroll = undefined;
    }
  }, [popup]);
  return (
    <>
      <header className=" min-h-20 w-screen sticky sm:top-0 bg-slate-100 shadow-md dark:bg-slate-900 z-10 flex justify-center sm:justify-between items-center py-2 px-6 sm:px-6 flex-wrap sm:flex-nowrap">
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
        <nav className="sm:hidden w-full">
          <ul className="flex text-2xl items-center justify-around w-full">
            <li>
              <NavLink
                to={"/"}
                className={({ isActive }) =>
                  `p-1 px-2 duration-200 ${
                    isActive
                      ? "text-green-500 bg-green-100 dark:bg-green-950 rounded"
                      : ""
                  }`
                }
              >
                <FontAwesomeIcon icon={faHome} />
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/trending"}
                className={({ isActive }) =>
                  `p-1 px-2 duration-200 ${
                    isActive
                      ? "text-green-500 bg-green-100 dark:bg-green-950 rounded"
                      : ""
                  }`
                }
              >
                <FontAwesomeIcon icon={faFire} />
              </NavLink>
            </li>
            <li>
              <button className="relative p-1">
                {notification && (
                  <span className="absolute right-[0.5px] top-[0.5px] w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                )}
                <FontAwesomeIcon
                  icon={faBell}
                  className="text-2xl hover:text-green-500 duration-100"
                />
              </button>
            </li>
            <li>
              <NavLink
                to={`/profile/${user.username}`}
                className={({ isActive }) =>
                  `block w-10 overflow-hidden rounded-full ${
                    isActive ? "border-2 border-green-500" : ""
                  } `
                }
              >
                <img
                  crossOrigin="anonymous"
                  src={`http://localhost:3000/users/${user.photo}`}
                  alt={`صورة ${user.fullName}`}
                />
              </NavLink>
            </li>
            <li>
              <button
                className={`text-2xl hover:text-green-500 duration-100 px-2 rounded ${
                  options && "text-green-500 dark:bg-green-900"
                }`}
                onClick={() => setOptions((prvOption) => !prvOption)}
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
            </li>
          </ul>
        </nav>
        <nav className="sm:flex justify-center w-2/5 hidden">
          <ul className="flex gap-10 sm:gap-5 md:gap-20 hover:*:text-green-500 *:text-2xl">
            <li>
              <NavLink
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                to={"/"}
                className={({ isActive }) =>
                  `p-1 px-2 duration-200 ${
                    isActive
                      ? "text-green-500 bg-green-100 dark:bg-green-950 rounded"
                      : ""
                  }`
                }
              >
                <FontAwesomeIcon icon={faHome} />
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/trending"}
                className={({ isActive }) =>
                  `p-1 px-2 duration-200 ${
                    isActive
                      ? "text-green-500 bg-green-100 dark:bg-green-950 rounded"
                      : ""
                  }`
                }
              >
                <FontAwesomeIcon icon={faFire} />
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="hidden items-center sm:gap-5 gap-10 relative sm:flex">
          <button className="relative p-1">
            <span className="absolute right-[0.5px] top-[0.5px] w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <FontAwesomeIcon
              icon={faBell}
              className="text-2xl hover:text-green-500 duration-100"
            />
          </button>
          <NavLink
            to={`/profile/${user.username}`}
            className={({ isActive }) =>
              `block w-10 h-10 overflow-hidden rounded-full ${
                isActive ? "border-2 border-green-500" : ""
              } `
            }
          >
            <img
              crossOrigin="anonymous"
              src={`http://localhost:3000/users/${user.photo}`}
              alt={`صورة ${user.fullName}`}
            />
          </NavLink>
          <button
            className={`text-2xl hover:text-green-500 duration-100 px-2 rounded ${
              options && "text-green-500 dark:bg-green-900"
            }`}
            onClick={() => setOptions((prvOption) => !prvOption)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
        {options && (
          <ul className="absolute left-2 top-full sm:mt-[-10px] rounded-md bg-slate-100 dark:bg-slate-800 p-3 w-52 *:flex *:justify-between *:py-4 *:px-2 *:rounded-sm *:font-bold *:cursor-pointer dark:hover:*:bg-slate-900">
            <li>
              <label>الإعدادات</label>
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
        <div
          onClick={(e) => {
            if (e.target.id === "background") {
              setPopup(false);
            }
          }}
          id="background"
          className="fixed z-20 top-[50%] right-[50%] w-screen h-screen bg-black translate-x-[50%] translate-y-[-50%] bg-opacity-60 flex justify-center items-center"
        >
          <div className="bg-white dark:bg-slate-900 min-w-80 max-w-96 w-1/2 h-40 p-3 rounded-lg flex flex-col justify-between">
            <h2 className="text-2xl font-bold">
              هل أنت متأكد من أنك تريد تسجيل الخروج؟
            </h2>
            <div className="flex flex-row-reverse *:font-bold">
              <button
                className="bg-red-500 px-4 py-2 rounded relative bottom-0"
                onClick={() => {
                  dispatch(setLogout());
                  nav("/login");
                }}
              >
                نعم
              </button>
              <button
                className="bg-slate-500 dark:bg-slate-700 px-6 py-2 rounded mx-5"
                onClick={() => setPopup(false)}
              >
                لا
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
