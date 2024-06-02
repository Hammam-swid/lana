/* eslint-disable react/prop-types */

import { faCheck, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function Report({ report, showModal }) {
  const token = useSelector((state) => state.token);
  const [postId, setPostId] = useState();
  const [currentReport, setCurrentReport] = useState(report);
  useEffect(() => {
    if (currentReport.reportedComment)
      axios({
        method: "GET",
        url: `/api/v1/reports/${currentReport.reportedComment}/post`,
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          setPostId(res.data.postId);
        })
        .catch((error) => console.log(error));
  }, [currentReport.reportedComment, token]);
  return (
    <div className="bg-slate-100 p-3 dark:bg-slate-900 rounded-md h-64 shadow-md relative flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-lg text-center">بلاغ</h3>
        <p>
          <span>النوع: </span>
          {currentReport.reportedPost
            ? "بلاغ منشور"
            : currentReport.reportedUser
            ? "بلاغ مستخدم"
            : currentReport.reportedComment
            ? "بلاغ تعليق"
            : ""}
        </p>
        <div>
          <span>السبب: </span>
          <span>{currentReport.reason}</span>
        </div>
        <div>
          <span>الوصف: </span>
          <span className="break-words">{currentReport.description}</span>
        </div>
      </div>
      <div className="flex flex-row-reverse justify-between">
        <div className="flex flex-row-reverse gap-3">
          <Link
            className="bg-gradient-to-b from-green-500 to-green-700 px-3 py-1 rounded-md text-white font-bold shadow-md"
            to={
              currentReport.reportedUser
                ? `/profile/${report.reportedUser.username}`
                : currentReport.reportedPost
                ? `/post/${report.reportedPost}`
                : currentReport.reportedComment
                ? `/post/${postId}?commentId=${currentReport.reportedComment}`
                : ""
            }
          >
            تتبع
          </Link>
          <button
            disabled={currentReport.seen}
            onClick={async () => {
              try {
                const res = await axios({
                  method: "PATCH",
                  url: `/api/v1/reports/${currentReport._id}`,
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (res.status === 200) {
                  console.log(res);
                  setCurrentReport(res.data.report);
                }
              } catch (error) {
                console.log(error);
              }
            }}
            className="bg-gradient-to-b from-green-500 to-green-700 px-1 disabled:grayscale rounded-md text-white font-bold shadow-md"
          >
            تعليم كمقروء
          </button>
        </div>
        <span>
          <FontAwesomeIcon
            icon={faCheck}
            className={`${
              currentReport.seen ? "text-green-500" : "text-gray-600"
            }`}
          />
        </span>
      </div>
      <button
        onClick={() => showModal(currentReport._id)}
        className="absolute top-3 end-3 text-lg text-slate-800 dark:text-green-100"
        title="حذف البلاغ"
      >
        <FontAwesomeIcon icon={faXmarkCircle} />
      </button>
    </div>
  );
}

export default Report;
