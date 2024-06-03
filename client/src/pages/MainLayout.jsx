import { Link, Outlet } from "react-router-dom";
import Header from "../components/Header";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentSlash,
  faFlag,
  faMessage,
  faThumbsDown,
  faThumbsUp,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import Warning from "../components/Warning";
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons";

function MainLayout() {
  const user = useSelector((state) => state.user);
  const theme = useSelector((state) => state.theme);
  const token = useSelector((state) => state.token);
  const [newNotification, setNewNotification] = useState(null);
  const [warning, setWarning] = useState(null);
  let [screenWidth, setScreenWidth] = useState(window.innerWidth);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    document.body.onresize = (e) => {
      console.log(e);
      setScreenWidth(e.currentTarget.innerWidth);
    };
  }, []);
  useEffect(() => {
    if (theme === "dark") document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, [theme]);
  useEffect(() => {
    const socket = io("/", {
      auth: { username: user.username },
    });
    socket.on("connect", () => {
      socket.emit("userLoggedIn", { username: user.username, role: user.role });
      socket.on("notification", (notification) => {
        console.log(newNotification);
        setNewNotification(notification);
        setTimeout(() => setNewNotification(null), 5000);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // console.log(window.visualViewport.width);
  useEffect(() => {
    const getWarnings = async () => {
      try {
        const res = await axios({
          method: "GET",
          url: `/api/v1/users/warnings`,
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res);
        if (res.data.warning) {
          setWarning(res.data.warning);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getWarnings();
  }, [token, user]);
  return (
    <>
      <Header notification={newNotification} />
      <AnimatePresence>
        {newNotification && (
          <motion.div
            initial={{
              y: screenWidth > 640 ? 100 : -120,
              x: screenWidth < 640 ? "50%" : 0,
            }}
            animate={{ y: 0, x: screenWidth < 640 ? "50%" : 0 }}
            // drag={window.visualViewport.width < 640 && 'y'}
            dragConstraints={{ bottom: 0, right: 0, left: 0 }}
            exit={{ y: screenWidth > 640 ? 100 : -120 }}
            onClick={() => setNewNotification(null)}
            className="fixed z-50 top-5 rounded-md right-1/2 bg-slate-100 dark:bg-slate-900 w-fit min-w-64 sm:mx-0 sm:top-auto sm:bottom-5 sm:right-5"
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
              <div className="flex justify-between items-center">
                <span>{newNotification.message}</span>
                <span
                  className={`ms-2 ${
                    newNotification.type === "dislike" ||
                    newNotification.type === "deleteComment" ||
                    newNotification.type === "verifyingRejected"
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
                  ) : newNotification.type === "report" ? (
                    <FontAwesomeIcon icon={faFlag} />
                  ) : newNotification.type.startsWith("verifying") ? (
                    <FontAwesomeIcon icon={faCheckCircle} />
                  ) : (
                    ""
                  )}
                </span>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      <Outlet />
      <Warning warning={warning} hide={() => setWarning(null)} />
    </>
  );
}

export default MainLayout;
