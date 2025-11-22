
"use client"

import React from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  isMuted: boolean;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, isMuted }) => {
  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
  embedUrl.searchParams.append('autoplay', '1');
  embedUrl.searchParams.append('mute', isMuted ? '1' : '0');
  embedUrl.searchParams.append('loop', '1');
  embedUrl.searchParams.append('playlist', videoId); // Required for loop to work
  embedUrl.searchParams.append('controls', '0');
  embedUrl.searchParams.append('showinfo', '0');
  embedUrl.searchParams.append('rel', '0');
  embedUrl.searchParams.append('iv_load_policy', '3');
  embedUrl.searchParams.append('modestbranding', '1');
  embedUrl.searchParams.append('playsinline', '1');
  
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
       <iframe
        src={embedUrl.toString()}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        allowFullScreen
        className="absolute top-1/2 left-1/2 w-full h-full min-w-[177.77vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2"
      ></iframe>
    </div>
  );
};

export default YouTubeEmbed;
