
'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import type { IptvChannel } from "@/types/tmdb";
import LoadingLink from "@/components/loading-link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ChannelCardProps {
  channel: IptvChannel;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="h-full"
    >
      <LoadingLink href={`/live-tv/${channel.id}`} className="h-full block">
        <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 hover:border-accent bg-card h-full flex flex-col group">
          <CardContent className="relative aspect-video p-0 flex items-center justify-center bg-zinc-900/50">
            {channel.logo ? (
              <Image
                src={channel.logo}
                alt={`${channel.name} logo`}
                width={120}
                height={120}
                className="object-contain w-auto h-auto max-h-[80px] group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <span className="text-muted-foreground text-xs">No Logo</span>
            )}
          </CardContent>
          <CardFooter className="p-3 flex-grow flex items-center justify-center">
            <h3 className="font-semibold text-center text-sm truncate">{channel.name}</h3>
          </CardFooter>
        </Card>
      </LoadingLink>
    </motion.div>
  );
}
