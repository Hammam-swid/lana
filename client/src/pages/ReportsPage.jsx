import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Suspense, useState } from "react";
import {
  Await,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Modal from "../components/Modal";
import axios from "axios";
import { useSelector } from "react-redux";
import Message from "../components/Message";
import Report from "../components/Report";

function ReportsPage() {
  const token = useSelector((state) => state.token);
  const promiseData = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type");
  const [modalData, setModalData] = useState({});
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const nav = useNavigate();
  const showModal = (reportId) =>
    setModalData({
      message: "هل أنت متأكد من أنك تريد حذف هذا البلاغ؟",
      hide: () => setModalData({}),
      action: async () => {
        try {
          const res = await axios({
            method: "DELETE",
            url: `/api/v1/reports/${reportId}`,
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.status === 204) {
            setMessage("تم حذف البلاغ بنجاح");
            nav(".");
          }
        } catch (error) {
          console.log(error);
          setMessage("حدث خطأ أثناء عملية الحذف");
          setMessageError(true);
          setTimeout(setMessageError, 3500, false);
        } finally {
          setTimeout(setMessage, 3000, "");
        }
      },
    });
  return (
    <>
      <div className="p-6 w-full">
        <h1 className="text-3xl font-bold mb-5">البلاغات</h1>
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => setSearchParams((prev) => prev.delete("type"))}
            className={`px-2 py-1 rounded-md ${
              !type
                ? "bg-green-500 font-bold text-white"
                : "bg-green-200 dark:bg-green-900"
            }`}
          >
            الكل
          </button>
          {[
            "اعتداء لفظي",
            "محتوى فاضح",
            "كفر",
            "إساءة",
            "خطاب كراهية",
            "عنصرية",
          ].map((ele) => (
            <button
              onClick={() => setSearchParams((prev) => prev.set("type", ele))}
              key={ele}
              className={`px-2 py-1 rounded-md ${
                type === ele
                  ? "bg-green-500 font-bold text-white"
                  : "bg-green-200 dark:bg-green-900"
              }`}
            >
              {ele}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-5 grid-rows-none w-full">
          <Suspense
            fallback={
              <div>
                <FontAwesomeIcon
                  icon={faCircleNotch}
                  className="text-2xl text-green-500 animate-spin"
                />
              </div>
            }
          >
            <Await resolve={promiseData.reports}>
              {(reports) =>
                reports.length > 0 ? (
                  reports
                    .filter((report) =>
                      type ? report.reason === type : report
                    )
                    .map((report) => (
                      <Report
                        key={report._id}
                        report={report}
                        showModal={showModal}
                      />
                    ))
                ) : (
                  <div className="text-xl text-gray-500">لا توجد بلاغات</div>
                )
              }
            </Await>
          </Suspense>
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

export default ReportsPage;
