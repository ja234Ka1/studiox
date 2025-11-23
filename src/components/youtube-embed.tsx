
"use client"

import React from 'react';
import YouTube, { type YouTubePlayer, type YouTubeProps } from 'react-youtube';

interface YouTubeEmbedProps {
  videoId: string;
  isMuted: boolean;
  onReady: YouTubeProps['onReady'];
  playerRef: React.MutableRefObject<YouTubePlayer | null>;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, isMuted, onReady, playerRef }) => {

  const opts: YouTubeProps['opts'] = {
    playerVars: {
      autoplay: 1,
      mute: isMuted ? 1 : 0,
      loop: 1,
      playlist: videoId, // Required for loop to work
      controls: 0,
      showinfo: 0,
      rel: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
    },
  };

  const handleReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    onReady(event);
  };

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
       <YouTube
        videoId={videoId}
        opts={opts}
        onReady={handleReady}
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2"
        iframeClassName="w-[177.77vh] min-w-[100vw] h-[100vw] min-h-[56.25vw]"
      />
    </div>
  );
};

export default YouTubeEmbed;
