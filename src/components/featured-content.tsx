
'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { PlayCircle, Info } from 'lucide-react';
import type { Media } from '@/types/tmdb';
import { getTmdbImageUrl, cn } from '@/lib/utils';
import { Button } from './ui/button';
import Link from 'next/link';

interface FeaturedContentProps {
  media: Media;
  textPosition?: 'left' | 'right';
}

export function FeaturedContent({ media, textPosition = 'right' }: FeaturedContentProps) {
  const title = media.title || media.name;
  const detailPath = `/media/${media.media_type}/${media.id}`;
  const streamPath = `/stream/${media.media_type}/${media.id}`;

  const isRightAligned = textPosition === 'right';

  const animationVariants = {
    hidden: { opacity: 0, x: isRightAligned ? 50 : -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  return (
    <section className="relative w-full h-[60vh] min-h-[500px] text-white">
      <div className="absolute inset-0">
        <Image
          src={getTmdbImageUrl(media.backdrop_path, 'original')}
          alt={title || 'Featured Content Backdrop'}
          fill
          priority
          className="object-cover object-top"
        />
        <div
          className={cn(
            'absolute inset-0 from-background/80 to-transparent',
            isRightAligned ? 'bg-gradient-to-l' : 'bg-gradient-to-r'
          )}
        />
      </div>

      <div
        className={cn(
          'relative z-10 h-full flex flex-col container mx-auto px-4 md:px-8',
          isRightAligned ? 'items-end' : 'items-start'
        )}
      >
        <motion.div
          className={cn(
            'w-full max-w-lg h-full flex flex-col justify-center',
            isRightAligned ? 'text-right' : 'text-left'
          )}
          variants={animationVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h1 className="text-5xl font-black mb-4 text-glow">
            {title}
          </h1>
          <p className="text-gray-300 mb-8 line-clamp-4">
            {media.overview}
          </p>
          <div
            className={cn(
              'flex gap-3',
              isRightAligned ? 'justify-end' : 'justify-start'
            )}
          >
            <Button size="lg" asChild className="button-bg-pan">
              <Link href={streamPath}>
                <PlayCircle />
                Watch Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10" asChild>
              <Link href={detailPath}>
                <Info />
                Details
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
