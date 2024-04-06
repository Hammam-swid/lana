import { faKey, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, Outlet } from "react-router-dom";

function SettingsLayout() {
  return (
    <div className="flex relative top-0 bottom-0 flex-1 p-6">
      <aside className="relative top-0 bottom-0 bg-slate-50 dark:bg-slate-900 p-6 hidden md:block rounded-md">
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
