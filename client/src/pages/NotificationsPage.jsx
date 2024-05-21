import {
  faCheck,
  faCommentSlash,
  faFlag,
  faMessage,
  faThumbsDown,
  faThumbsUp,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { Suspense, useState } from "react";
import { useSelector } from "react-redux";
import { Await, Link, useLoaderData } from "react-router-dom";
import Message from "../components/Message";

function NotificationsPage() {
  const promiseData = useLoaderData();
  const token = useSelector((state) => state.token);
  const [message, setMessage] = useState("");
  return (
    <div className="flex flex-col p-5 gap-5 *:bg-slate-50 *:dark:bg-slate-900">
      <Suspense fallback={<>جار التحميل</>}>
        <Await resolve={promiseData.notifications}>
          {(notifications) =>
            notifications?.length > 0 ? (
              <>
                <button
                  onClick={async () => {
                    try {
                      const res = await axios({
                        method: "PATCH",
                        url: "/api/v1/notifications",
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      console.log(res);
                      setMessage("تم تعليم كل الإشعارات كمقروء");
                      setTimeout(setMessage, 3000, "");
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                  className="p-2 duration-200 rounded-md dark:hover:bg-green-900 hover:bg-green-200 flex justify-center items-center gap-2"
                >
                  <span>تعليم الكل كمقروء</span>
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                {notifications.map((noti) => (
                  <Link
                    onClick={async () => {
                      try {
                        const res = await axios({
                          method: "PATCH",
                          url: `/api/v1/notifications/${noti._id}`,
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        console.log(res);
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                    to={noti.returnUrl}
                    className={`p-2 bg-slate-200 dark:bg-slate-950 block rounded-md ${
                      noti.seen ? "text-gray-500" : "font-bold shadow-md"
                    }`}
                    key={noti._id}
                  >
                    <p>
                      {new Date(noti.createdAt).toLocaleString("ar", {
                        day: "2-digit",
                        year: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="flex justify-between items-center">
                      <span className="w-5/6">{noti.message}</span>
                      <span
                        className={`block text-white ${
                          noti.type === "dislike" ||
                          noti.type === "deleteComment" ||
                          noti.type === "verifyingRejected"
                            ? "bg-red-500"
                            : "bg-green-500"
                        } rounded-full px-2 py-1`}
                      >
                        {noti.type === "like" ? (
                          <FontAwesomeIcon icon={faThumbsUp} />
                        ) : noti.type === "dislike" ? (
                          <FontAwesomeIcon icon={faThumbsDown} />
                        ) : noti.type === "comment" ? (
                          <FontAwesomeIcon icon={faMessage} />
                        ) : noti.type === "deleteComment" ? (
                          <FontAwesomeIcon icon={faCommentSlash} />
                        ) : noti.type === "follow" ? (
                          <FontAwesomeIcon icon={faUserPlus} />
                        ) : noti.type === "report" ? (
                          <FontAwesomeIcon icon={faFlag} />
                        ) : noti.type.startsWith("verifying") ? (
                          <FontAwesomeIcon icon={faCheckCircle} />
                        ) : (
                          ""
                        )}
                      </span>
                    </p>
                    <p>
                      <FontAwesomeIcon
                        icon={faCheck}
                        className={`${
                          noti.seen ? "text-green-500" : "text-gray-500"
                        }`}
                      />{" "}
                    </p>
                  </Link>
                ))}
              </>
            ) : (
              <>لا توجد إشعارات</>
            )
          }
        </Await>
      </Suspense>
      <Message message={message} />
    </div>
  );
}

export default NotificationsPage;
