import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
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

function Header() {
  const user = useSelector((state) => state.user);
  const [popup, setPopup] = useState(false);
  const [options, setOptions] = useState(false);
  const nav = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    if (popup) {
      window.onscroll = (ev) => {
        ev.preventDefault();
      };
    }
  }, [popup]);
  return (
    <>
      <header className="h-20 mb-5 w-screen flex justify-between items-center px-3 sm:px-6 flex-wrap sm:flex-nowrap">
        <div className="flex justify-between relative items-center gap-5 w-full sm:w-fit">
          <p className="text-3xl font-bold">لنا</p>
          <input
            type="text"
            name="search"
            id="search"
            className="p-2 rounded-md dark:bg-slate-800"
          />
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-2 text-2xl"
          />
        </div>
        <nav className="flex justify-center">
          <ul className="flex gap-5 md:gap-20 hover:*:text-green-500 *:text-2xl">
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
          </ul>
        </nav>
        <div className="flex items-center gap-5 relative">
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
          <button
            className={`text-2xl hover:text-green-500 duration-100 px-2 rounded ${
              options && "text-green-500 dark:bg-green-900"
            }`}
            onClick={() => setOptions((prvOption) => !prvOption)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          {options && (
            <ul className="absolute left-0 top-full mt-1 rounded-md dark:bg-slate-800 p-3 w-52 *:flex *:justify-between *:py-4 *:px-2 *:rounded-sm *:font-bold *:cursor-pointer dark:hover:*:bg-slate-900">
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
        </div>
      </header>
      {popup && (
        <div
          onClick={(e) => {
            if (e.target.id === "background") {
              setPopup(false);
            }
          }}
          id="background"
          className="absolute top-[50%] right-[50%] w-screen h-screen bg-black translate-x-[50%] translate-y-[-50%] bg-opacity-60 flex justify-center items-center"
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
                className="bg-gray-100 dark:bg-slate-700 px-6 py-2 rounded mx-5"
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
