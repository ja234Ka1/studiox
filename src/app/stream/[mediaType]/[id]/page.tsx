
'use client'

import { notFound, useParams } from "next/navigation";
import type { MediaType } from "@/types/tmdb";

type Props = {
  // Params are no longer passed as props in this client component
  // but we keep the type for structure.
  params: {
    mediaType: MediaType;
    id: string;
  };
};

export default function StreamPage({}: Props) {
  // Use the hook to get params on the client
  const params = useParams<{ mediaType: MediaType; id: string }>();
  const { mediaType, id } = params;

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
