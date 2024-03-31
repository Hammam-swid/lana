/* eslint-disable react/prop-types */
import {
  faEllipsisH,
  faFlag,
  // faEllipsisH,
  // faEllipsisVertical,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function Comment({ comment, removeComment, updateComment, postId, postUser }) {
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);
  const [options, setOptions] = useState(false);
  return (
    <div className="p-3 flex items-center gap-3">
      <Link to={`/profile/${comment.user.username}`}>
        <img
          src={`/img/users/${comment.user.photo}`}
          alt={`صورة ${comment.user.fullName}`}
          className="w-10 h-10 rounded-full overflow-hidden"
        />
      </Link>
      <div className="dark:bg-slate-900 p-3 rounded-md flex-1 relative">
        <Link
          to={`/profile/${comment.user.username}`}
          className="font-bold mb-2"
        >
          {comment.user.fullName}
        </Link>
        <p>{comment.text}</p>
        <button
          type="button"
          className="absolute left-3 top-1/2 -translate-y-1/2"
          onClick={() => setOptions((prev) => !prev)}
        >
          <FontAwesomeIcon icon={faEllipsisH} />
        </button>
        {options && (
          <ul className="dark:bg-slate-800 absolute z-20 left-0 p-3 rounded-md dark:hover:*:bg-slate-900 *:p-2 *:rounded-md">
            {comment.user.username === user.username ||
            user.username === postUser.username ||
            user.role === "admin" ||
            user.role === "supervisor" ? (
              <li>
                <button
                  onClick={async () => {
                    try {
                      const res = await axios({
                        method: "DELETE",
                        url: `/api/v1/posts/${postId}/comment/${comment._id}`,
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      console.log(res);
                      if (res.status === 204) {
                        removeComment(comment._id);
                      }
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                >
                  <span>حذف التعليق</span>{" "}
                  <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                </button>
              </li>
            ) : (
              <li>
                <button>
                  <span>الإبلاغ عن التعليق</span>
                  <FontAwesomeIcon icon={faFlag} className="text-red-500" />
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Comment;
