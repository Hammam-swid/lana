/* eslint-disable react/prop-types */
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function SearchSuggestions({ value, removeValue }) {
  const token = useSelector((state) => state.token);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    if (value) setSearching(true);
    const getSuggestions = async () => {
      try {
        const res = await axios({
          method: "POST",
          url: "/api/v1/search/suggest",
          headers: { Authorization: `Bearer ${token}` },
          data: { search: value },
        });
        console.log(res);
        if (res.status === 200) {
          setSuggestions(res.data.users);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setSearching(false);
      }
    };
    if (value) getSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <AnimatePresence>
      {value && (
        <motion.div
          initial={{ scale: 0, originX: "50%" }}
          animate={{ scale: 1, originY: "0%", originX: "50%" }}
          exit={{ scale: 0 }}
          className="absolute z-50 start-0 w-full bg-slate-100 dark:bg-slate-900 rounded-md top-full p-6 flex flex-col gap-3"
        >
          {searching ? (
            <FontAwesomeIcon
              icon={faCircleNotch}
              className="text-green-500 animate-spin"
            />
          ) : suggestions.length > 0 ? (
            suggestions.map((suggest) => (
              <Link
                onClick={removeValue}
                to={`/profile/${suggest.username}`}
                key={suggest._id}
                className="flex items-center gap-2"
              >
                <img
                  src={`/img/users/${suggest.photo}`}
                  alt={`صورة ${suggest.fullName}`}
                  className="w-8 h-8 object-cover rounded-full"
                />
                <div>
                  <h4>{suggest.fullName}</h4>
                  <p dir="ltr" className="text-right text-gray-500">
                    @{suggest.username}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <h3 className="text-gray-500">لا يوجد اقتراحات مطابقة</h3>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SearchSuggestions;
