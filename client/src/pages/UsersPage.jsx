import { faCircleNotch, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Suspense, useState } from "react";
import { Await, useLoaderData } from "react-router-dom";
import UserComponent from "../components/UserComponent";

function UsersPage() {
  const promiseData = useLoaderData();
  const [search, setSearch] = useState("");
  console.log(search);
  const regex = new RegExp(`^${search}|${search}$|(.*)${search}(.*)$`, "i");
  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold mb-5">المستخدمون</h1>
      <div className="mb-5">
        <input
          className="p-2 rounded-md dark:bg-slate-900 outline-none focus:outline-2 focus:outline-green-500 me-2"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />{" "}
        <span className="text-xl">
          <FontAwesomeIcon icon={faSearch} />
        </span>
      </div>
      <div className="grid grid-cols-3 w-full gap-3">
        <Suspense
          fallback={
            <div>
              <FontAwesomeIcon
                icon={faCircleNotch}
                className="text-2xl text-green-500 animate-spin"
              />
            </div>
          }
        >
          <Await resolve={promiseData.users}>
            {(users) =>
              users
                .filter((user) =>
                  search
                    ? regex.test(user.fullName) || regex.test(user.username)
                    : true
                )
                .map((user) => <UserComponent key={user._id} gotUser={user} />)
            }
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

export default UsersPage;
