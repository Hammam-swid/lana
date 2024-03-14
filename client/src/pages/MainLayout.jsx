import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import io from "socket.io-client";
import { useEffect } from "react";
import { useSelector } from "react-redux";
function MainLayout() {
  const user = useSelector((state) => state.user);
  const socket = io("http://localhost:3000", {
    auth: { username: user.username },
  });
  useEffect(() => {
    socket.on("connect", () => {
      socket.on("notification", (notification) => {
        console.log(notification);
      });
    });
  }, [socket]);
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default MainLayout;
