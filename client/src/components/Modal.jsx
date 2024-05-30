import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* eslint-disable react/prop-types */
function Modal({ action, message, hide }) {
  useEffect(() => {
    document.body.style.overflow =
      action && message && hide ? "hidden" : "auto";
  }, [message, action, hide]);
  return (
    <AnimatePresence>
      {message && action && hide && (
        <motion.div
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target.id === "overlay") {
              hide();
              document.body.style.overflow = "auto";
            }
          }}
          id="overlay"
          className="px-5 py-3 fixed z-50 top-0 start-0 w-screen h-screen bg-black  bg-opacity-60 flex justify-center items-end md:items-center"
        >
          <motion.div
            animate={{ scale: 1 }}
            initial={{ scale: 0 }}
            // exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-900 min-w-80 w-full md:max-w-96 h-fit p-3 rounded-lg flex flex-col justify-between"
          >
            <h2 className="text-2xl font-bold">{message}</h2>
            <div className="flex flex-col mt-5 gap-3 md:flex-row-reverse *:font-bold *:text-lg">
              <button
                className="bg-red-500 px-4 py-2 rounded relative bottom-0"
                onClick={() => {
                  action();
                  document.body.style.overflow = "auto";
                  hide();
                }}
              >
                نعم
              </button>
              <button
                className="bg-slate-500 dark:bg-slate-700 px-6 py-2 rounded"
                onClick={() => {
                  hide();
                  document.body.style.overflow = "auto";
                }}
              >
                لا
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
