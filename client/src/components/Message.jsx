/* eslint-disable react/prop-types */
function Message({ message }) {
  return (
    <div className="fixed bottom-2 bg-opacity-75 shadow-md outline outline-2 outline-green-500 bg-slate-50 dark:bg-opacity-75 dark:bg-slate-900 z-50 p-9 flex justify-center items-center start-1/2 translate-x-1/2 rounded-md  font-bold">
      {message}
    </div>
  );
}

export default Message;
