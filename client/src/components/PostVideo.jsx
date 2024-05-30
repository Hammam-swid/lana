/* eslint-disable react/prop-types */
function PostVideo({ video }) {
  return (
    <div>
      <video
        muted
        controls
        className="rounded-md max-h-[35rem] w-full bg-black"
      >
        <source src={`/videos/${video}`} />
      </video>
    </div>
  );
}

export default PostVideo;
