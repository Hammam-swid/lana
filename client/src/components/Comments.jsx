/* eslint-disable react/prop-types */
import { useState } from "react";

function Comments(props) {
  const [comments, setComments] = useState(props.comments);
  return <div>{comments.length > 0 ? "قسم التعليقات" : "لا توجد تعليقات"}</div>;
}

export default Comments;
