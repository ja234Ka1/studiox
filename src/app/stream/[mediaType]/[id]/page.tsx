
import { notFound } from "next/navigation";
import { getMediaDetails } from "@/lib/tmdb";
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

export default async function MovieStreamPage({ params }: Props) {
  const { mediaType, id } = params;

  if (mediaType !== "movie") {
    notFound();
  }

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    notFound();
  }

  const item = await getMediaDetails(numericId, mediaType);
  const streamUrl = `https://cinemaos.tech/player/${item.id}`;

  return (
    <div className="w-full h-screen bg-black flex flex-col">
      <div className="p-4 flex items-center justify-between bg-black/50 absolute top-0 left-0 right-0 z-10">
        <Button asChild variant="ghost">
          <Link href={`/media/${mediaType}/${id}`}>
            <ArrowLeft className="mr-2" /> Back to details
          </Link>
        </Button>
        <h1 className="text-xl font-bold text-white truncate">{item.title || item.name}</h1>
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
