"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { MediaType } from "@/types/tmdb";

interface VideoContextType {
  isPlaying: boolean;
  mediaId: number | null;
  mediaType: MediaType | null;
  playVideo: (id: number, type: MediaType) => void;
  stopVideo: () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);

  const playVideo = (id: number, type: MediaType) => {
    setMediaId(id);
    setMediaType(type);
    setIsPlaying(true);
  };

  const stopVideo = () => {
    setIsPlaying(false);
    setMediaId(null);
    setMediaType(null);
  };

  const value = {
    isPlaying,
    mediaId,
    mediaType,
    playVideo,
    stopVideo,
  };

  return (
    <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
  );
}

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
};
