/* eslint-disable react/prop-types */

function ImagePreview({ image }) {
  return (
    <div className="relative">
      <img
        key={image}
        src={image}
        className="w-16 h-16 object-cover rounded-md outline outline-2 outline-green-950 overflow-hidden"
      />
    </div>
  );
}

export default ImagePreview;
