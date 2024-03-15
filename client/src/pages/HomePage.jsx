import { useDispatch, useSelector } from "react-redux";
import { setLogout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
function HomePage() {
  const user = useSelector((state) => state.user);
  return (
    <>
      <h1 className="text-7xl font-light mb-10">الصفحة الرئيسية</h1>
      <h2 className="text-4xl h-96">{user?.fullName}</h2>
    </>
  );
}

export default HomePage;
