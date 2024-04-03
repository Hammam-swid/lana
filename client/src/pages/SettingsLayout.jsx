import { NavLink, Outlet } from "react-router-dom";

function SettingsLayout() {
  return (
    <div className="flex relative top-0 bottom-0 flex-1 p-6">
      <aside className="relative top-0 bottom-0 dark:bg-slate-900 p-6 hidden md:block rounded-md">
        <nav className=" h-full">
          <ul className=" flex flex-col gap-2 dark:hover:*:bg-slate-950 *:rounded-md">
            <li>
              <NavLink
                to="."
                end
                className={({ isActive }) =>
                  `p-3 rounded-md block ${
                    isActive && "text-green-500 bg-slate-950"
                  }`
                }
              >
                إعدادات الملف الشخصي
              </NavLink>
            </li>
            <li>
              <NavLink
                to="change-password"
                className={({ isActive }) =>
                  `p-3 rounded-md block ${
                    isActive && "text-green-500 bg-slate-950"
                  }`
                }
              >
                تغيير كلمة المرور
              </NavLink>
            </li>
            <li>
              <NavLink
                to="deactivate-account"
                className={({ isActive }) =>
                  `p-3 rounded-md block ${
                    isActive && "text-green-500 bg-slate-950"
                  }`
                }
              >
                إلغاء تفعيل الحساب
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
