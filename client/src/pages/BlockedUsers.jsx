import { Suspense, useState } from "react";
import { Await, useLoaderData, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import Message from "../components/Message";
import axios from "axios";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

function BlockedUsers() {
  const nav = useNavigate();
  const token = useSelector((state) => state.token);
  const promiseData = useLoaderData();
  const [modalData, setModalData] = useState({});
  const [message, setMessage] = useState("");
  return (
    <div className="mx-auto max-w-[40rem] flex flex-col gap-5 p-3 mt-20">
      <Suspense
        fallback={
          <div>
            <FontAwesomeIcon
              icon={faCircleNotch}
              className="text-xl text-green-500 animate-spin"
            />
          </div>
        }
      >
        <Await resolve={promiseData.blockedUsers}>
          {(users) => {
            console.log(users);
            if (users?.length > 0)
              return users.map((user) => (
                <div
                  className="flex items-center justify-between dark:bg-slate-900 bg-slate-50 p-3 rounded-md shadow-md"
                  key={user._id}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={`/img/users/${user.photo}`}
                      alt={`صورة ${user.fullName}`}
                      className="w-14 h-14 rounded-full"
                    />
                    <h3 className="font-bold">{user.fullName}</h3>
                  </div>
                  <button
                    onClick={() =>
                      setModalData({
                        message: "هل أنت متأكد من أنك تريد إلغاء الحظر؟",
                        hide: () => setModalData({}),
                        action: async () => {
                          try {
                            const res = await axios({
                              method: "DELETE",
                              url: `/api/v1/users/${user._id}/block`,
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            if (res.status === 200) {
                              setMessage("تم إلغاء الحظر بنجاح");
                              setTimeout(setMessage, 3000, "");
                              nav(".", { replace: true });
                            }
                          } catch (error) {
                            console.log(error);
                          }
                        },
                      })
                    }
                    className="bg-gray-500 p-2 font-bold rounded-md hover:bg-red-500 duration-200"
                  >
                    إلغاء الحظر
                  </button>
                </div>
              ));
            else
              return (
                <h2 className="text-xl text-gray-500">
                  لا يوجد أشخاص تم حظرهم
                </h2>
              );
          }}
        </Await>
      </Suspense>
      <Modal
        message={modalData.message}
        hide={modalData.hide}
        action={modalData.action}
      />
      <Message message={message} />
    </div>
  );
}

export default BlockedUsers;
