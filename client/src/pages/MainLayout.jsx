import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
function MainLayout() {
  const user = useSelector((state) => state.user);
  const [newNotification, setNewNotification] = useState(false)
  useEffect(() => {
    const socket = io("http://localhost:3000", {
      auth: { username: user.username },
    });
    socket.on("connect", () => {
      socket.emit("userLoggedIn", user.username);
      socket.on("notification", (notification) => {
        setNewNotification(true)
        console.log(notification);
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Header notification={newNotification} />
      <Outlet />
    </>
  );
}

export default MainLayout;
