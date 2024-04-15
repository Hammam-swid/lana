import { Link, Outlet } from "react-router-dom";
import Header from "../components/Header";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentSlash,
  faMessage,
  faThumbsDown,
  faThumbsUp,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
function MainLayout() {
  const user = useSelector((state) => state.user);
  const theme = useSelector((state) => state.theme);
  const [newNotification, setNewNotification] = useState(null);
  useEffect(() => {
    if (theme === "dark") document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, [theme]);
  useEffect(() => {
    const socket = io("/", {
      auth: { username: user.username },
    });
    socket.on("connect", () => {
      socket.emit("userLoggedIn", user.username);
      socket.on("notification", (notification) => {
        console.log(newNotification);
        setNewNotification(notification);
        setTimeout(() => setNewNotification(null), 5000);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Header notification={newNotification} />
      {newNotification && (
        <Link
          onClick={() => setNewNotification(null)}
          className="p-3 rounded-md dark:bg-slate-900 w-fit fixed mx-auto z-30 top-32 sm:mx-0 sm:top-auto sm:bottom-5 sm:right-5"
          to={newNotification.returnUrl}
        >
          <h3 className="text-xl font-bold">إشعار جديد</h3>
          {newNotification.message}
          <span
            className={`ms-2 ${
              newNotification.type === "dislike" ||
              newNotification.type === "deleteComment"
                ? "bg-red-500"
                : "bg-green-500"
            } py-1 px-2 inline-block rounded-full`}
          >
            {newNotification.type === "like" ? (
              <FontAwesomeIcon icon={faThumbsUp} />
            ) : newNotification.type === "dislike" ? (
              <FontAwesomeIcon icon={faThumbsDown} />
            ) : newNotification.type === "comment" ? (
              <FontAwesomeIcon icon={faMessage} />
            ) : newNotification.type === "deleteComment" ? (
              <FontAwesomeIcon icon={faCommentSlash} />
            ) : newNotification.type === "follow" ? (
              <FontAwesomeIcon icon={faUserPlus} />
            ) : (
              ""
            )}
          </span>
        </Link>
      )}
      <Outlet />
    </>
  );
}

export default MainLayout;
