/* eslint-disable react/prop-types */
import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Modal from "./Modal";
import Message from "./Message";

function ModeratorComponent({ gotUser }) {
  const token = useSelector((state) => state.token);
  const [user, setUser] = useState(gotUser);
  const [modalData, setModalData] = useState({});
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  return (
    <>
      <div className="p-3 rounded-md max-h-24 bg-slate-100 shadow-md dark:bg-slate-900 flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <Link to={`/profile/${user.username}`}>
            <img
              src={`/img/users/${user.photo}`}
              className="w-14 h-14 object-cover rounded-md"
              alt={`صورة ${user.fullName}`}
            />
          </Link>
          <div className="flex flex-col justify-between h-full py-1">
            <Link className="font-bold" to={`/profile/${user.username}`}>
              <p>{user.fullName}</p>
              <p dir="ltr" className="text-gray-500 font-normal text-right">
                @{user.username}
              </p>
            </Link>
            <p>
              <span
                className={`${
                  user.state === "active" ? "text-green-500" : "text-red-500"
                }`}
              >
                {user.state === "active"
                  ? "فعال "
                  : user.state === "nonactive"
                  ? "غير مفعل "
                  : user.state === "banned"
                  ? "محظور "
                  : ""}
              </span>
              <span className="ms-5 font-bold">
                {user.role === "admin" ? " مدير النظام" : "مشرف النظام"}
              </span>
            </p>
          </div>
        </div>
        <div>
          <button
            className={`px-2 py-1 font-bold rounded-md ${
              user.state === "active" ? "bg-red-500" : "bg-green-500"
            }`}
            onClick={() =>
              setModalData({
                message:
                  user.state === "active"
                    ? "هل أنت متأكد من أنك تريد إلغاء تفعيل هذا الحساب؟"
                    : user.state === "nonactive"
                    ? "هل أنت متأكد من أنك تريد تفعيل هذا الحساب؟"
                    : "",
                hide: () => setModalData({}),
                action: async () => {
                  try {
                    let route =
                      user.state === "active"
                        ? "deactivateModerator"
                        : user.state === "nonactive"
                        ? "activateModerator"
                        : "";
                    const res = await axios({
                      method: "PATCH",
                      url: `/api/v1/users/${user._id}/${route}`,
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    console.log(res);
                    if (res.data.status === "success") {
                      setUser(res.data.user);
                      setMessage(
                        user.state === "active"
                          ? "تم إلغاء التفعيل بنجاح"
                          : user.state === "nonactive"
                          ? "تم التفعيل بنجاح"
                          : ""
                      );
                    }
                  } catch (error) {
                    setMessage("حدث خطأ أثناء تنفيذ العملية");
                    setMessageError(true);
                    console.log(error);
                  } finally {
                    setTimeout(setMessage, 3000, "");
                    if (messageError) setTimeout(setMessageError, 3500, false);
                  }
                },
              })
            }
          >
            {user.state === "active"
              ? "إلغاء التفعيل"
              : user.state === "nonactive"
              ? "تفعيل"
              : user.state === "banned"
              ? "إلغاء الحظر"
              : ""}
          </button>
        </div>
      </div>
      <Modal
        message={modalData.message}
        action={modalData.action}
        hide={modalData.hide}
      />
      <Message message={message} error={messageError} />
    </>
  );
}

export default ModeratorComponent;
