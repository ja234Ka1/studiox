
'use client';

import { motion } from "framer-motion";
import type { IptvChannel } from "@/types/tmdb";
import { ChannelCard } from "./channel-card";

interface CategorySectionProps {
  title: string;
  channels: IptvChannel[];
  delay?: number;
}

export function CategorySection({ title, channels, delay = 0 }: CategorySectionProps) {
  if (channels.length === 0) {
    return (
        <p className="text-muted-foreground text-center">No channels found for "{title}".</p>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay }}
    >
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {channels.map(channel => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    </motion.section>
  );
}
