
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import type { Media } from '@/types/tmdb';
import { cn, getTmdbImageUrl } from '@/lib/utils';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import LoadingLink from './loading-link';

interface Channel {
    name: string;
    shows: Media[];
}

interface ChannelGuideProps {
    channels: Channel[];
}

export function ChannelGuide({ channels }: ChannelGuideProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [nowPlaying, setNowPlaying] = useState<Media | null>(channels[0]?.shows[0] || null);
    
    const activeChannel = channels[activeIndex];

    // Effect to cycle through shows on the active channel
    useEffect(() => {
        if (!activeChannel || activeChannel.shows.length === 0) return;

        let showIndex = 0;
        setNowPlaying(activeChannel.shows[showIndex]);

        const intervalId = setInterval(() => {
            showIndex = (showIndex + 1) % activeChannel.shows.length;
            setNowPlaying(activeChannel.shows[showIndex]);
        }, 10000); // Change show every 10 seconds

        return () => clearInterval(intervalId);
    }, [activeIndex, activeChannel]);
    
    if (!nowPlaying) {
        return <div className="text-center p-8">No channels available.</div>
    }

    const detailPath = `/media/${nowPlaying.media_type}/${nowPlaying.id}`;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 h-full gap-0">
            {/* Channel List */}
            <div className="col-span-1 border-r border-border bg-background/50 h-full">
                <ScrollArea className="h-full">
                    <div className="p-2">
                        {channels.map((channel, index) => (
                            <button
                                key={channel.name}
                                onClick={() => setActiveIndex(index)}
                                className={cn(
                                    "w-full text-left p-3 rounded-md transition-colors text-sm",
                                    activeIndex === index ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/50'
                                )}
                            >
                                <span className="font-mono text-muted-foreground mr-2">{String(index + 1).padStart(2, '0')}</span>
                                {channel.name}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Now Playing View */}
            <div className="col-span-1 md:col-span-2 relative h-full overflow-hidden">
                <AnimatePresence>
                    <motion.div
                        key={nowPlaying.id}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={getTmdbImageUrl(nowPlaying.backdrop_path, 'original')}
                            alt={nowPlaying.name || ''}
                            fill
                            className="object-cover"
                        />
                    </motion.div>
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-l from-black/50 to-transparent" />

                <div className="relative z-10 p-6 md:p-8 flex flex-col justify-end h-full text-white">
                     <AnimatePresence mode="wait">
                        <motion.div
                            key={nowPlaying.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.5 } }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                {nowPlaying.name}
                            </h2>
                            <p className="text-muted-foreground line-clamp-3 mb-6 max-w-xl text-white/80">
                                {nowPlaying.overview}
                            </p>
                            <Button size="lg" asChild className="button-bg-pan">
                                <LoadingLink href={detailPath}>
                                    <PlayCircle /> Watch Now
                                </LoadingLink>
                            </Button>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
