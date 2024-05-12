import { faCheckCircle } from "@fortawesome/free-regular-svg-icons";
import { faFlag, faUserTie, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import { NavLink, Outlet } from "react-router-dom";

function DashboardLayout() {
  const user = useSelector((state) => state.user);
  return (
    <div className="flex flex-1">
      <aside className="bg-slate-100 dark:bg-slate-900 p-6 min-w-64">
        <nav className="flex flex-col gap-3">
          <NavLink
            to={"."}
            end
            className={({ isActive }) =>
              `flex justify-between items-center rounded-md hover:bg-slate-200 dark:hover:bg-slate-950 ${
                isActive &&
                "text-green-500 font-bold dark:bg-slate-950 bg-slate-200"
              } p-3 duration-200`
            }
          >
            <span>إدارة البلاغات</span>
            <FontAwesomeIcon icon={faFlag} />
          </NavLink>
          <NavLink
            to={"verifying-requests"}
            end
            className={({ isActive }) =>
              `flex justify-between items-center rounded-md hover:bg-slate-200 dark:hover:bg-slate-950 ${
                isActive &&
                "text-green-500 font-bold dark:bg-slate-950 bg-slate-200"
              } p-3 duration-200`
            }
          >
            <span>طلبات التوثيق</span>
            <FontAwesomeIcon icon={faCheckCircle} />
          </NavLink>
          <NavLink
            to={"users"}
            className={({ isActive }) =>
              `flex justify-between items-center rounded-md hover:bg-slate-200 dark:hover:bg-slate-950 ${
                isActive &&
                "text-green-500 font-bold dark:bg-slate-950 bg-slate-200"
              } p-3 duration-200`
            }
          >
            <span>إدارة المستخدمين</span>
            <FontAwesomeIcon icon={faUsers} />
          </NavLink>
          {user.role === "admin" && (
            <NavLink
              to={"moderators"}
              className={({ isActive }) =>
                `flex justify-between items-center rounded-md hover:bg-slate-200 dark:hover:bg-slate-950 ${
                  isActive &&
                  "text-green-500 font-bold dark:bg-slate-950 bg-slate-200"
                } p-3 duration-200`
              }
            >
              <span>إدارة المشرفين</span>
              <FontAwesomeIcon icon={faUserTie} />
            </NavLink>
          )}
        </nav>
      </aside>
      <Outlet />
    </div>
  );
}

export default DashboardLayout;
