import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faFire,
  faArrowRightFromBracket,
  faMagnifyingGlass,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { setLogout } from "../store/authSlice";
import { useState } from "react";

function Header() {
  const user = useSelector((state) => state.user);
  const [popup, setPopup] = useState(false);
  const nav = useNavigate();
  const dispatch = useDispatch();
  return (
    <>
      <header className="h-20 mb-5 w-screen flex justify-between items-center px-6">
        <div className="flex flex-row-reverse relative items-center gap-5">
          <input
            type="text"
            name="search"
            id="search"
            className="p-2 rounded-md dark:bg-slate-800 hidden sm:block peer"
          />
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="sm:absolute sm:left-2 text-2xl"
          />
          <p className="text-3xl font-bold peer-focus:hidden">لنا</p>
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
        <div className="flex items-center gap-5">
          <button className="relative p-1">
            <span className="absolute right-[0.5px] top-[0.5px] w-3 h-3 bg-red-500 rounded-full"></span>
            <FontAwesomeIcon
              icon={faBell}
              className="text-2xl hover:text-green-500 duration-100"
            />
          </button>
          <NavLink
            to={`/profile/${user.username}`}
            className={({ isActive }) =>
              `block w-11 overflow-hidden rounded-full ${
                isActive ? "border-2 border-green-500" : ""
              } `
            }
          >
            <img
              crossOrigin="anonymous"
              src={`http://localhost:3000/users/${user.photo}`}
              alt={`${user.fullName} photo`}
            />
          </NavLink>
          <button
            className="text-2xl hover:text-green-500 duration-100"
            onClick={() => {
              setPopup(true);
            }}
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
          </button>
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
