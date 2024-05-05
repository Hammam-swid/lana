import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useSelector } from "react-redux";

/* eslint-disable react/prop-types */
function Warning({ warning, hide }) {
  const token = useSelector((state) => state.token);
  useEffect(() => {
    document.body.style.overflow = warning ? "hidden" : "auto";
  }, [warning]);
  return (
    <AnimatePresence>
      {warning && (
        <motion.div
          exit={{ opacity: 0 }}
          className="fixed start-0 top-0 w-full h-screen bg-black bg-opacity-60 z-50 flex flex-col justify-center items-center px-5"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-slate-100 dark:bg-slate-900 p-6 rounded-md max-w-96 w-full flex flex-col gap-3"
          >
            <h1 className="text-2xl text-center font-bold mb-5">
              <span>تحذير</span>
              <FontAwesomeIcon
                icon={faWarning}
                className="text-yellow-500 ms-3 align-middle"
              />
            </h1>
            <h3 className="font-bold">
              لقد قمت باختراق قوانين المنصة في إحدى{" "}
              {warning.type === "post"
                ? "منشوراتك"
                : warning.type === "comment"
                ? "تعليقاتك"
                : ""}
            </h3>
            <p>
              <span className="font-bold">السبب: </span>
              <span>{warning.reason}</span>
            </p>
            <div>
              <p className="font-bold">رسالة من المشرف:</p>
              <p>{warning.message}</p>
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={async () => {
                  try {
                    const res = await axios({
                      method: "PATCH",
                      url: `/api/v1/users/warnings/${warning._id}`,
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.status === 200) {
                      hide();
                    }
                  } catch (error) {
                    console.log(error);
                  }
                }}
                className="px-3 py-1 bg-gradient-to-b from-green-500 to-green-700 text-green-100 rounded-md shadow-md font-bold"
              >
                حسناً
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Warning;
