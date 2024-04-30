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
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

function MainLayout() {
  const user = useSelector((state) => state.user);
  const theme = useSelector((state) => state.theme);
  const token = useSelector((state) => state.token);
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
      socket.emit("userLoggedIn", {username: user.username, role: user.role});
      socket.on("notification", (notification) => {
        console.log(newNotification);
        setNewNotification(notification);
        setTimeout(() => setNewNotification(null), 5000);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // console.log(window.visualViewport.width);
  return (
    <>
      <Header notification={newNotification} />
      <AnimatePresence>
        {newNotification && (
          <motion.div
            initial={{
              y: 100,
            }}
            animate={{ y: 0 }}
            // drag={window.visualViewport.width < 640 && 'y'}
            dragConstraints={{ bottom: 0, right: 0, left: 0 }}
            exit={{ y: 100 }}
            onClick={() => setNewNotification(null)}
            className="fixed z-50 top-5 rounded-md right-1/2 bg-slate-100 dark:bg-slate-900 w-fit  sm:mx-0 sm:top-auto sm:bottom-5 sm:right-5"
          >
            <Link
              onClick={async () => {
                try {
                  const res = await axios({
                    method: "PATCH",
                    url: `/api/v1/notifications/${newNotification._id}`,
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  console.log(res);
                } catch (error) {
                  console.log(error);
                }
              }}
              className="p-3 block"
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
          </motion.div>
        )}
      </AnimatePresence>
      <Outlet />
    </>
  );
}

export default MainLayout;
