
'use client'

import { notFound } from "next/navigation";
import type { MediaType } from "@/types/tmdb";

type Props = {
  params: {
    mediaType: MediaType;
    id: string;
  };
};

export default function StreamPage({ params: { mediaType, id } }: Props) {
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
    <div className="w-screen h-screen bg-black">
      <iframe
          src={streamUrl}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-full border-0"
      />
    </div>
  );
}
