import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import io from "socket.io-client";
function MainLayout() {
  const socket = io("http://localhost:3000");
  socket.on("connect", () => {
    // console.log(socket.id);
    socket.on('welcome', (message) => {
      console.log(message)
    })
  });
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default MainLayout;
