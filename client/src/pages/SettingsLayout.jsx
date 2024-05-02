import {
  faBars,
  faCheckCircle,
  faKey,
  faLock,
  faUser,
  faUserLock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

function SettingsLayout() {
  const [showAside, setShowAside] = useState(false);
  return (
    <div
      onClick={(e) =>
        e.target.id !== "show-aside" &&
        e.target.id !== "icon-aside" &&
        e.target.getAttribute("fill") !== "currentColor" &&
        setShowAside(false)
      }
      className="flex relative top-0 bottom-0 flex-1 p-6"
    >
      <button
        id="show-aside"
        onClick={() => {
          setShowAside(true);
        }}
        className="md:hidden absolute text-3xl px-2 py-1 hover:text-green-500 rounded-md dark:bg-slate-900"
      >
        <FontAwesomeIcon id="icon-aside" icon={faBars} />
      </button>
      <aside
        className={`${
          !showAside ? "-right-80" : "right-0"
        } z-10 duration-300 md:right-0 absolute md:relative top-0 bottom-0 bg-slate-50 dark:bg-slate-900 p-6 md:block rounded-md`}
      >
        <nav className=" h-full">
          <ul className=" flex flex-col gap-2 dark:hover:*:bg-slate-950 hover:*:bg-slate-200 *:rounded-md">
            <li>
              <NavLink
                to="."
                end
                className={({ isActive }) =>
                  `p-3 rounded-md flex justify-between items-center gap-2 ${
                    isActive &&
                    "text-green-500 font-bold bg-slate-200 dark:bg-slate-950"
                  }`
                }
              >
                <span>إعدادات الملف الشخصي</span>
                <FontAwesomeIcon icon={faUser} />
              </NavLink>
            </li>
            <li>
              <NavLink
                to="verify-account"
                className={({ isActive }) =>
                  `p-3 rounded-md flex justify-between items-center ${
                    isActive &&
                    "text-green-500 font-bold bg-slate-200 dark:bg-slate-950"
                  }`
                }
              >
                <span>توثيق الحساب</span>
                <FontAwesomeIcon icon={faCheckCircle} />
              </NavLink>
            </li>
            <li>
              <NavLink
                to="blocked-users"
                className={({ isActive }) =>
                  `p-3 rounded-md flex justify-between items-center ${
                    isActive &&
                    "text-green-500 font-bold bg-slate-200 dark:bg-slate-950"
                  }`
                }
              >
                <span>الأشخاص المحظورون</span>
                <FontAwesomeIcon icon={faUserLock} />
              </NavLink>
            </li>
            <li>
              <NavLink
                to="change-password"
                className={({ isActive }) =>
                  `p-3 rounded-md flex justify-between items-center ${
                    isActive &&
                    "text-green-500 font-bold bg-slate-200 dark:bg-slate-950"
                  }`
                }
              >
                <span>تغيير كلمة المرور</span>
                <FontAwesomeIcon icon={faLock} />
              </NavLink>
            </li>
            <li>
              <NavLink
                to="deactivate-account"
                className={({ isActive }) =>
                  `p-3 rounded-md flex justify-between items-center ${
                    isActive &&
                    "text-green-500 font-bold bg-slate-200 dark:bg-slate-950"
                  }`
                }
              >
                <span>إلغاء تفعيل الحساب</span>
                <FontAwesomeIcon icon={faKey} className="text-red-500" />
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default SettingsLayout;
