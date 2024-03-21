/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import PostImages from "./PostImages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faThumbsDown,
  faMessage,
  faShare,
  faEllipsisVertical,
  faTrash,
  faFlag,
  faPen,
  faEarthAfrica,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { useState } from "react";
import axios from "axios";

function Post(props) {
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const [post, setPost] = useState(props.post);
  const [postOptions, setPostOptions] = useState(false);
  return (
    <div
      id={post._id}
      onClick={(e) => {
        if (post._id === e.target.id)
          return postOptions && setPostOptions(false);
      }}
      className="bg-slate-100 shadow-md dark:bg-slate-900 rounded p-6 flex flex-col gap-5 my-5"
    >
      <div className="flex justify-between items-center relative">
        <Link
          to={`/profile/${post.user.username}`}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src={`/img/users/${post.user.photo}`}
              alt={`صورة ${props?.user?.fullName}`}
            />
          </div>
          <h3 className="font-bold">{post.user.fullName}</h3>
        </Link>
        <button
          className="text-xl"
          onClick={() => setPostOptions((prev) => !prev)}
        >
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>
        {postOptions && (
          <div className="absolute left-3 top-1/3 dark:bg-slate-800 p-3 w-48 rounded-md">
            <ul className="*:flex *:justify-between *:items-center hover:*:dark:bg-slate-900 *:p-2 *:rounded-md">
              {user.role === "admin" ||
              user.role === "supervisor" ||
              user.username === post.user.username ? (
                <li>
                  <button
                    onClick={async () => {
                      console.log("delete");
                      try {
                        const res = await axios({
                          url: `/api/v1/posts/${post._id}`,
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        console.log(res);
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                  >
                    حذف المنشور
                  </button>
                  <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                </li>
              ) : (
                <li>
                  <button>الإبلاغ عن المنشور</button>
                  <FontAwesomeIcon icon={faFlag} className="text-red-500" />
                </li>
              )}
              {user.username === post.user.username && (
                <li>
                  <button>تعديل المنشور</button>
                  <FontAwesomeIcon icon={faPen} />
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      <p className="text-gray-500 -mt-5 ms-12">
        <FontAwesomeIcon icon={faEarthAfrica} className="me-2 text-sm" />
        {new Date(post.createdAt).toLocaleString("ar", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
        {/* {new Date(post.createdAt).getSeconds(0)} */}
      </p>
      <h3>{post.content}</h3>
      {post.images?.length > 0 && (
        <PostImages images={post.images} fullName={post.user.fullName} />
      )}
      <div className="flex justify-around items-center *:text-xl hover:*:dark:bg-slate-950 *:p-2 *:rounded-md">
        <button
          onClick={async () => {
            try {
              let route = "like";
              if (
                post.reactions
                  .filter((reaction) => reaction.type === "like")
                  .find((reaction) => reaction.username === user.username)
              ) {
                route = "cancelReaction";
              }
              const res = await axios({
                headers: { Authorization: `Bearer ${token}` },
                method: "PATCH",
                url: `/api/v1/posts/${post._id}/${route}`,
              });
              if (res.data.status === "success") setPost(res.data.post);
            } catch (error) {
              console.log(error);
            }
          }}
          className="flex items-center justify-center"
        >
          <FontAwesomeIcon
            icon={faThumbsUp}
            className={
              post.reactions
                ?.filter((reaction) => reaction.type === "like")
                .find((reaction) => reaction.username === user.username) &&
              "text-green-500"
            }
          />
          <span className="text-xl ms-2">
            {
              post.reactions?.filter((reaction) => reaction.type === "like")
                .length
            }
          </span>
        </button>
        <button
          onClick={async () => {
            try {
              let route = "dislike";
              if (
                post.reactions
                  .filter((reaction) => reaction.type === "dislike")
                  .find((reaction) => reaction.username === user.username)
              ) {
                route = "cancelReaction";
              }
              const res = await axios({
                headers: { Authorization: `Bearer ${token}` },
                method: "PATCH",
                url: `/api/v1/posts/${post._id}/${route}`,
              });
              if (res.data.status === "success") setPost(res.data.post);
            } catch (err) {
              console.log(err.message);
            }
          }}
        >
          <FontAwesomeIcon
            icon={faThumbsDown}
            className={
              post.reactions
                ?.filter((reaction) => reaction.type === "dislike")
                .find((reaction) => reaction.username === user.username) &&
              "text-green-500"
            }
          />
          <span className="text-xl ms-2">
            {
              post.reactions?.filter((reaction) => reaction.type === "dislike")
                .length
            }
          </span>
        </button>
        <button>
          <FontAwesomeIcon icon={faMessage} />
          <span className="text-xl ms-2">{props?.comments?.length}</span>
        </button>
        <button>
          <FontAwesomeIcon icon={faShare} />
        </button>
      </div>
    </div>
  );
}

export default Post;
