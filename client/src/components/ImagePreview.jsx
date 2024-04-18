/* eslint-disable react/prop-types */

import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ImagePreview({ image }) {
  return (
    <div className="relative">
      <img
        key={image}
        src={image}
        className="w-16 h-16 object-cover rounded-md overflow-hidden"
      />
      <button
        type="button"
        className="w-5 h-5 rounded-full flex justify-center items-center text-white dark:text-black bg-opacity-80 bg-gray-800 dark:bg-white absolute -top-2 -end-2"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
}

export default ImagePreview;
