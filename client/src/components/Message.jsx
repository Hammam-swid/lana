/* eslint-disable react/prop-types */
import { faFaceFrown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
function Message({ message, error }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          whileHover={{ scale: 1.2, y: -10 }}
          animate={{ y: 0, x: "50%" }}
          initial={{ y: 200, x: "50%" }}
          exit={{ y: 200, x: "50%" }}
          className={`fixed bottom-2 text-center bg-opacity-75 shadow-md outline outline-2 ${
            error ? "outline-red-500" : "outline-green-500"
          } bg-slate-50 dark:bg-opacity-75 dark:bg-slate-900 z-50 p-9 flex justify-center items-center start-1/2 -translate-x-1/2 rounded-md  font-bold`}
        >
          {error && (
            <span>
              <FontAwesomeIcon
                icon={faFaceFrown}
                className="text-red-500 me-2"
              />
            </span>
          )}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Message;
