import { faFire, faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";

function NavBar() {
  return (
    <nav className="sm:flex justify-center w-fit hidden">
      <ul className="flex md:gap-10 sm:gap-5 lg:gap-20 hover:*:text-green-500 *:text-2xl">
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
  );
}
export default NavBar;
