
import { notFound } from "next/navigation";
import type { MediaType } from "@/types/tmdb";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: {
    mediaType: MediaType;
    id: string;
  };
   searchParams: { [key: string]: string | string[] | undefined };
};

export default function StreamPage({ params, searchParams }: Props) {
  const { mediaType, id } = params;

  if (mediaType !== "tv" && mediaType !== "movie") {
    notFound();
  }

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    notFound();
  }
  
  const title = typeof searchParams.title === 'string' ? searchParams.title : 'Stream';

  const streamUrl = mediaType === 'tv'
    ? `https://cinemaos.tech/player/${id}/1/1`
    : `https://cinemaos.tech/player/${id}`;
    
  const itemTitle = mediaType === 'tv'
    ? `${title} - S1 E1`
    : title;

  return (
    <div className="w-full h-screen bg-black flex flex-col">
       <div className="p-4 flex items-center justify-between bg-black/50 absolute top-0 left-0 right-0 z-10">
        <Button asChild variant="ghost">
          <Link href={`/media/${mediaType}/${id}`}>
            <ArrowLeft className="mr-2" /> Back to details
          </Link>
        </Button>
        <h1 className="text-xl font-bold text-white truncate">{itemTitle}</h1>
      </div>
      <iframe
        src={streamUrl}
        allow="autoplay; fullscreen"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
}
