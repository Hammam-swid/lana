/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";

function Comments(props) {
  const [comments, setComments] = useState(props.comments);
  return (
    <div className="dark:bg-slate-950 p-6 rounded-md flex flex-col gap-5">
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment._id} className="dark:bg-slate-900 p-3 rounded-md">
            <Link
              to={`/profile/${comment.user.username}`}
              className="flex gap-2 items-center mb-2"
            >
              <img
                src={`/img/users/${comment.user.photo}`}
                alt={`صورة ${comment.user.fullName}`}
                className="w-10 h-10 rounded-full overflow-hidden"
              />
              <p className="font-bold">{comment.user.fullName}</p>
            </Link>
            <p>{comment.text}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500">لا توجد تعليقات</p>
      )}
    </div>
  );
}

export default Comments;
