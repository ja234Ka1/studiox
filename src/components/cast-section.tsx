
'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import LoadingLink from "./loading-link";
import { getTmdbImageUrl } from "@/lib/utils";
import type { CastMember } from "@/types/tmdb";

const castVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

interface CastSectionProps {
  topCast: CastMember[];
}

export function CastSection({ topCast }: CastSectionProps) {
  return (
    <motion.div
      className="mt-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Top Cast</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
        {topCast.map((member, index) => (
          <LoadingLink
            key={member.id}
            href={`/person/${member.id}`}
            className="group"
          >
            <motion.div
              className="text-center"
              variants={castVariants}
              custom={index}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-muted shadow-lg">
                <Image
                  src={getTmdbImageUrl(member.profile_path, "w500")}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="font-semibold text-sm group-hover:text-accent transition-colors">{member.name}</p>
              <p className="text-xs text-muted-foreground">
                {member.character}
              </p>
            </motion.div>
          </LoadingLink>
        ))}
      </div>
    </motion.div>
  );
}
