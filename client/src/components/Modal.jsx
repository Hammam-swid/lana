import { useEffect } from "react";

/* eslint-disable react/prop-types */
function Modal({ action, message, hide }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);
  return (
    <div
      onClick={(e) => {
        if (e.target.id === "overlay") {
          hide();
          document.body.style.overflow = "auto";
        }
      }}
      id="overlay"
      className="fixed z-50 top-[50%] right-[50%] w-screen h-screen bg-black translate-x-[50%] translate-y-[-50%] bg-opacity-60 flex justify-center items-center"
    >
      <div className="bg-white dark:bg-slate-900 min-w-80 max-w-96 w-1/2 h-40 p-3 rounded-lg flex flex-col justify-between">
        <h2 className="text-2xl font-bold">{message}</h2>
        <div className="flex flex-row-reverse *:font-bold">
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
            className="bg-slate-500 dark:bg-slate-700 px-6 py-2 rounded mx-5"
            onClick={() => {
              hide();
              document.body.style.overflow = "auto";
            }}
          >
            لا
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
