
'use client'

import { notFound, useSearchParams } from "next/navigation";
import type { MediaType } from "@/types/tmdb";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: {
    mediaType: MediaType;
    id: string;
  };
};

export default function StreamPage({ params }: Props) {
  const { mediaType, id } = params;
  const searchParams = useSearchParams();

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
    <div className="w-full flex flex-col pt-16">
       <div className="container px-4 md:px-8 mx-auto py-4 flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link href={`/media/${mediaType}/${id}`}>
            <ArrowLeft className="mr-2" /> Back to details
          </Link>
        </Button>
        <h1 className="text-xl font-bold truncate">{itemTitle}</h1>
      </div>
      <div className="w-full aspect-video bg-black">
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
