import { useEffect, useState } from "react";

/* eslint-disable react/prop-types */
function PostVideo({ video }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  useEffect(() => {
    document.body.onfullscreenchange = (e) => setIsFullScreen(e.bubbles);
  }, []);
  return (
    <div>
      <video
        muted
        controls
        className={`rounded-md max-h-[35rem] w-full bg-black ${
          isFullScreen ? "object-contain" : "object-cover"
        }`}
      >
        <source src={`/videos/${video}`} />
      </video>
    </div>
  );
}

export default PostVideo;
