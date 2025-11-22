
'use client'

import { GENRES } from "@/lib/genres";
import LoadingLink from "@/components/loading-link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function DiscoverPage() {
  return (
    <div className="container px-4 md:px-8 lg:px-16 py-12 pb-24 mx-auto">
      <header className="text-center max-w-4xl mx-auto mb-12">
        <motion.h1 
          className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Explore a curated selection of movies and series organized by categories.
        </motion.h1>
        <motion.p 
          className="text-muted-foreground text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Discover a wide variety of genres, from classics to the latest releases. Dive into adventures, romances, comedies, dramas, horrors, documentaries, and more. Browse through our categories and find the next great story that will capture your imagination.
        </motion.p>
      </header>

      <motion.div 
        className="flex flex-wrap justify-center gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {GENRES.map((genre) => (
          <motion.div key={genre.id} variants={itemVariants}>
            <Button
              asChild
              variant="outline"
              className="rounded-full px-6 py-3 text-base transition-all duration-300 hover:bg-accent/10 hover:border-accent hover:text-accent hover:shadow-[0_0_15px_hsl(var(--accent))]"
            >
              <LoadingLink href={`/search?q=${encodeURIComponent(genre.name)}`}>
                {genre.name}
              </LoadingLink>
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
