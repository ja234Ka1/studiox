
"use client"

import React from 'react';
import YouTube, { type YouTubeProps } from 'react-youtube';

interface YouTubeEmbedProps {
  videoId: string;
  onReady: YouTubeProps['onReady'];
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, onReady }) => {
  const opts: YouTubeProps['opts'] = {
    playerVars: {
      autoplay: 1,
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

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
       <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        className="absolute top-1/2 left-1/2 w-[177.77vh] min-w-[100vw] h-[56.25vw] min-h-[100vh] -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};

export default YouTubeEmbed;
