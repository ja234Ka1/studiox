
'use client'

import { notFound } from "next/navigation";
import type { MediaType } from "@/types/tmdb";
import { useEffect, useRef } from "react";

type Props = {
  params: {
    mediaType: MediaType;
    id: string;
  };
};

export default function StreamPage({ params }: Props) {
  const mediaType = params.mediaType;
  const id = params.id;
  const fullscreenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fullscreenRef.current) {
      fullscreenRef.current.requestFullscreen().catch(err => {
        console.error("Error attempting to enable full-screen mode:", err.message);
      });
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // User exited fullscreen, so we can navigate back
        window.history.back();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (mediaType !== "tv" && mediaType !== "movie") {
    notFound();
  }

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    notFound();
  }

  const streamUrl = mediaType === 'tv'
    ? `https://cinemaos.tech/player/${id}/1/1`
    : `https://cinemaos.tech/player/${id}`;

  return (
    <div ref={fullscreenRef} className="w-screen h-screen bg-black">
      <iframe
          src={streamUrl}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-full border-0"
      />
    </div>
  );
}
