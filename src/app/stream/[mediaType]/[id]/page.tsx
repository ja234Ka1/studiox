
'use client'

import { notFound, useSearchParams } from "next/navigation";
import type { MediaType } from "@/types/tmdb";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";

type Props = {
  params: {
    mediaType: MediaType;
    id: string;
  };
};

export default function StreamPage({ params: { mediaType, id } }: Props) {
  const searchParams = useSearchParams();
  const fullscreenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fullscreenRef.current) {
      fullscreenRef.current.requestFullscreen().catch(err => {
        console.error("Error attempting to enable full-screen mode:", err.message);
      });
    }
  }, []);

  if (mediaType !== "tv" && mediaType !== "movie") {
    notFound();
  }

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    notFound();
  }
  
  const title = searchParams.get('title') || 'Stream';

  const streamUrl = mediaType === 'tv'
    ? `https://cinemaos.tech/player/${id}/1/1`
    : `https://cinemaos.tech/player/${id}`;
    
  const itemTitle = mediaType === 'tv'
    ? `${title} - S1 E1`
    : title;

  return (
    <div ref={fullscreenRef} className="w-full h-full flex flex-col pt-16 bg-background">
       <div className="container px-4 md:px-8 mx-auto py-4 flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link href={`/media/${mediaType}/${id}`}>
            <ArrowLeft className="mr-2" /> Back to details
          </Link>
        </Button>
        <h1 className="text-xl font-bold truncate">{itemTitle}</h1>
      </div>
      <div className="w-full flex-1 aspect-video bg-black">
        <iframe
            src={streamUrl}
            allow="autoplay; fullscreen"
            allowFullScreen
            className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
