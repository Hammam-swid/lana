/* eslint-disable react/prop-types */
import {
  faBars,
  faBell,
  faFire,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

function MobileNavBar({ options, updateOptions, notification }) {
  const user = useSelector((state) => state.user);
  return (
    <nav className="sm:hidden w-full sticky top-0">
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
          <NavLink
            to={"notifications"}
            className={({ isActive }) =>
              `p-1 px-2 duration-200 block relative ${
                isActive
                  ? "text-green-500 bg-green-100 dark:bg-green-950 rounded"
                  : ""
              }`
            }
          >
            {notification > 0 && (
              <span className="absolute right-[5px] top-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            )}
            <FontAwesomeIcon
              icon={faBell}
              className="text-2xl hover:text-green-500 duration-100"
            />
          </NavLink>
        </li>
        <li>
          <NavLink
            to={`/profile/${user.username}`}
            className={({ isActive }) =>
              `block rounded-full ${
                isActive ? "outline outline-2 outline-green-500" : ""
              } `
            }
          >
            <img
              src={`/img/users/${user.photo}`}
              alt={`صورة ${user.fullName}`}
              className="w-8 h-8 overflow-hidden rounded-full object-cover"
            />
          </NavLink>
        </li>
        <li>
          <button
            className={`text-2xl hover:text-green-500 duration-100 px-2 rounded ${
              options && "text-green-500 dark:bg-green-900"
            }`}
            onClick={updateOptions}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </li>
      </ul>
    </nav>
  );
}
export default MobileNavBar;
