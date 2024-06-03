/* eslint-disable react/prop-types */
import {
  faArrowLeft,
  faArrowRight,
  faArrowUpRightFromSquare,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useState } from "react";
import { Document, Page } from "react-pdf";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Modal from "./Modal";
import Message from "./Message";

function VerifyingRequestPreview({ request }) {
  const token = useSelector((state) => state.token);
  const nav = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [numOfPages, setNumOfPages] = useState(0);
  const [modalData, setModalData] = useState({});
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  console.log(request.profileUrl.split("/profile/"));
  return (
    <div className="dark:bg-slate-900 bg-slate-100 rounded-md h-[32rem] p-3 shadow-md flex flex-col justify-between">
      {request.verificationFile.split(".")[1] === "pdf" ? (
        <>
          <div className="max-h-96 overflow-y-scroll overflow-x-hidden w-full rounded-md outline outline-2 outline-green-500 ">
            <Document
              file={`/verificationFiles/${request.verificationFile}`}
              onLoadSuccess={(doc) => {
                setNumOfPages(doc.numPages);
              }}
              onLoadError={(error) => console.log(error)}
            >
              <Page
                width={500}
                className={"h-fit w-fit overflow-hidden mx-auto"}
                pageNumber={currentPage}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                renderForms={false}
              />
            </Document>
          </div>
          <p>
            {" "}
            {currentPage} من {numOfPages}
          </p>
          <div>
            <button
              disabled={currentPage <= 1}
              className="disabled:text-gray-600"
              onClick={() =>
                setCurrentPage((prev) => (prev === 1 ? prev : prev - 1))
              }
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
            <button
              disabled={currentPage >= numOfPages}
              className="ms-3 disabled:text-gray-600"
              onClick={() =>
                setCurrentPage((prev) =>
                  prev === numOfPages ? prev : prev + 1
                )
              }
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          </div>
        </>
      ) : (
        <img
          className="w-full max-h-96 object-contain rounded-md overflow-y-scroll outline outline-2 outline-green-500"
          src={`/verificationFiles/${request.verificationFile}`}
        />
      )}
      <div className="my-2">
        <p className="font-bold">الوصف:</p>
        {request.description}
      </div>
      <div className="flex justify-between items-end">
        <div className="hover:*:underline">
          <a
            className="block"
            href={`/verificationFiles/${request.verificationFile}`}
            target="_blank"
          >
            <span>
              عرض{" "}
              {request.verificationFile.split(".")[1] === "pdf"
                ? "الملف"
                : "الصورة"}{" "}
              في صفحة منفصلة
            </span>
            <FontAwesomeIcon
              icon={faArrowUpRightFromSquare}
              flip="horizontal"
              className="align-middle ms-2"
            />
          </a>
          <Link to={request.profileUrl}>
            <span>عرض الملف الشخصي</span>
            <FontAwesomeIcon icon={faUser} className="align-middle ms-3" />
          </Link>
        </div>
        <div>
          <button
            onClick={async () => {
              try {
                const res = await axios({
                  method: "PATCH",
                  url: `/api/v1/verifyingRequests/${request._id}`,
                  headers: { Authorization: `Bearer ${token}` },
                });
                console.log(res);
                nav(".");
              } catch (error) {
                console.log(error);
              }
            }}
            disabled={request.seen}
            className="p-2 disabled:grayscale bg-gradient-to-b from-green-500 to-green-700 font-bold text-white rounded-md ms-2"
          >
            تعليم كمقروء
          </button>
          <button
            onClick={() =>
              setModalData({
                message: "هل أنت متأكد من أنك تريد الموافقة على هذا الطلب؟",
                hide: () => setModalData({}),
                action: async () => {
                  try {
                    const res = await axios({
                      method: "PATCH",
                      url: `/api/v1/verifyingRequests/${request._id}/ok`,
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    console.log(res);
                    setMessage(res.data.message);
                  } catch (error) {
                    console.log(error);
                    setMessage(
                      error.response?.data?.message ||
                        "حدث خطأ أثناء تنفيذ العملية"
                    );
                    setMessageError(true);
                  } finally {
                    setTimeout(setMessage, 3000, "");
                    setTimeout(setMessageError, 3100, false);
                  }
                },
              })
            }
            className="p-2 bg-gradient-to-b from-green-500 to-green-700 font-bold text-white rounded-md ms-2"
          >
            موافقة
          </button>
          <button
            onClick={() =>
              setModalData({
                message: "هل أنت متأكد من أنك تريد رفض هذا الطلب؟",
                hide: () => setModalData({}),
                action: async () => {
                  try {
                    const res = await axios({
                      method: "delete",
                      url: `/api/v1/verifyingRequests/${request._id}`,
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    console.log(res);
                    setMessage(res.data.message);
                    setTimeout(() => {
                      nav(".");
                      setMessage("");
                    }, 3000);
                  } catch (error) {
                    console.log(error);
                    setMessage(
                      error.response?.data?.message ||
                        "حدث خطأ أثناء تنفيذ العملية"
                    );
                    setMessageError(true);
                    setTimeout(setMessage, 3000, "");
                    setTimeout(setMessageError, 3100, false);
                  }
                },
              })
            }
            className="p-2 bg-gradient-to-b from-red-500 to-red-700 font-bold text-white rounded-md ms-2"
          >
            رفض
          </button>
        </div>
      </div>
      <Modal
        message={modalData.message}
        action={modalData.action}
        hide={modalData.hide}
      />
      <Message message={message} error={messageError} />
    </div>
  );
}

export default VerifyingRequestPreview;
