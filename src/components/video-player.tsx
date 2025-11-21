
"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useVideo } from "@/context/video-provider";
import { getVideos } from "@/lib/tmdb";
import type { Video } from "@/types/tmdb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const VIDEO_SOURCE_BASE_URLS = {
  YouTube: "https://www.youtube.com/embed/",
  Vimeo: "https://player.vimeo.com/video/",
};

export default function VideoPlayer() {
  const { isPlaying, mediaId, mediaType, stopVideo } = useVideo();
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPlaying && mediaId && mediaType) {
      const fetchVideos = async () => {
        setIsLoading(true);
        setError(null);
        setVideos([]);
        setSelectedVideo(null);
        try {
          const fetchedVideos = await getVideos(mediaId, mediaType);
          const officialTrailers = fetchedVideos.filter(
            (v) => v.official && v.type === "Trailer"
          );
          const anyTrailers = fetchedVideos.filter((v) => v.type === "Trailer");
          
          const videoList = officialTrailers.length > 0 ? officialTrailers : anyTrailers.length > 0 ? anyTrailers : fetchedVideos;

          if (videoList.length > 0) {
            setVideos(videoList);
            setSelectedVideo(videoList[0]);
          } else {
            setError("No playable videos found for this title.");
          }
        } catch (e) {
          setError("Could not load video information.");
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchVideos();
    }
  }, [isPlaying, mediaId, mediaType]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      stopVideo();
      setVideos([]);
      setSelectedVideo(null);
    }
  };

  const getEmbedUrl = (video: Video | null) => {
    if (!video) return "";
    const baseUrl = VIDEO_SOURCE_BASE_URLS[video.site as keyof typeof VIDEO_SOURCE_BASE_URLS];
    return baseUrl ? `${baseUrl}${video.key}` : "";
  };
  
  const videoSrc = getEmbedUrl(selectedVideo);
  
  return (
    <Dialog open={isPlaying} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl w-full h-auto p-0 border-0 bg-card">
        <DialogHeader>
          <DialogTitle>
            {selectedVideo?.name ? (
              <span className="sr-only">{selectedVideo.name}</span>
            ) : (
              <VisuallyHidden>Video Player</VisuallyHidden>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="aspect-video relative bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          {error && !isLoading && (
             <div className="absolute inset-0 flex items-center justify-center p-4">
                <Alert variant="destructive">
                    <AlertTitle>Playback Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
             </div>
          )}
          {videoSrc && !isLoading && (
            <iframe
              src={videoSrc}
              title={selectedVideo?.name || "Video Player"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          )}
        </div>
        {(videos.length > 1 || selectedVideo) && !isLoading && !error && (
            <div className="p-4 pt-0 flex items-center justify-between">
                <p className="font-semibold truncate mr-4">{selectedVideo?.name}</p>
                {videos.length > 1 && (
                    <Select
                        onValueChange={(key) => setSelectedVideo(videos.find(v => v.key === key) || null)}
                        defaultValue={selectedVideo?.key}
                    >
                        <SelectTrigger className="w-[220px] flex-shrink-0">
                            <SelectValue placeholder="Select a video" />
                        </SelectTrigger>
                        <SelectContent>
                            {videos.map(v => (
                                <SelectItem key={v.id} value={v.key}>{v.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

