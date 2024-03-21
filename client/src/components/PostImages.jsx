/* eslint-disable react/prop-types */
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";

function PostImages(props) {
  const [showedImage, setShowedImage] = useState(0);
  return (
    <div className="">
      <div className="rounded-md overflow-hidden w-full max-h-[500px] relative group/image">
        <img
          src={`/img/posts/${props.images[showedImage]}`}
          alt={`صورة منشور ${props?.fullName}`}
          className="object-cover"
        />
        {props?.images?.length > 1 && (
          <button
            className="absolute right-5 top-1/2 bg-white bg-opacity-60 text-green-900 rounded-full w-10 h-10 duration-75 hover:right-4 invisible group-hover/image:visible"
            onClick={() => {
              setShowedImage((pervIndex) =>
                pervIndex + 1 === props?.images?.length ? 0 : pervIndex + 1
              );
            }}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        )}
        {props?.images?.length > 1 && (
          <button
            className="absolute left-5 top-1/2 bg-white bg-opacity-60 text-green-900 rounded-full w-10 h-10 duration-75 hover:left-4 invisible group-hover/image:visible"
            onClick={() => {
              setShowedImage((pervIndex) =>
                pervIndex === 0 ? props.images.length - 1 : pervIndex - 1
              );
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        )}
      </div>
      <div className="text-center">
        {props.images.map((image, index) => (
          <FontAwesomeIcon
            key={image}
            icon={faCircle}
            className={`text-[8px] mx-1 ${
              showedImage === index && "text-green-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default PostImages;
