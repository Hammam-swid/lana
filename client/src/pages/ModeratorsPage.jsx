import {
  faCircleNotch,
  faSearch,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Suspense, useState } from "react";
import { Await, useLoaderData } from "react-router-dom";
import ModeratorComponent from "../components/ModeratorComponent";
import AddModerator from "../components/AddModerator";

function ModeratorsPage() {
  const promiseData = useLoaderData();
  const [search, setSearch] = useState("");
  const [showAddMod, setShowAddMod] = useState(false);
  console.log(search);
  const regex = new RegExp(`^${search}|${search}$|(.*)${search}(.*)$`, "i");
  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold mb-5">المشرفون والمدراء</h1>
      <div className="mb-5 flex justify-between ">
        <div>
          <input
            className="p-2 rounded-md bg-slate-100 dark:bg-slate-900 outline-none focus:outline-2 focus:outline-green-500 me-2"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />{" "}
          <span className="text-xl">
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>
        <button
          onClick={() => setShowAddMod(true)}
          className="px-2 py-1 rounded-md bg-green-500 font-bold text-md align-middle shadow-md text-green-50"
        >
          <span>إضافة مشرف</span>
          <FontAwesomeIcon
            icon={faUserPlus}
            flip="horizontal"
            className="ms-3"
          />
        </button>
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
          <Await resolve={promiseData.moderators}>
            {(users) =>
              users
                .filter((moderator) =>
                  search
                    ? regex.test(moderator.fullName) ||
                      regex.test(moderator.username)
                    : true
                )
                .map((moderator) => (
                  <ModeratorComponent key={moderator._id} gotUser={moderator} />
                ))
            }
          </Await>
        </Suspense>
      </div>
      <AddModerator show={showAddMod} hide={() => setShowAddMod(false)} />
    </div>
  );
}
export default ModeratorsPage;
