
import { notFound } from "next/navigation";
import Image from "next/image";
import { getMediaDetails } from "@/lib/tmdb";
import type { MediaType } from "@/types/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { Star } from "lucide-react";
import MediaCarousel from "@/components/media-carousel";
import { DetailPageHero } from "@/components/detail-page-hero";
import { EpisodeSelector } from "@/components/episode-selector";
import LoadingLink from "@/components/loading-link";
import { motion } from "framer-motion";

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

interface MediaDetailsPageProps {
    params: {
        mediaType: MediaType;
        id: string;
    }
}

export default async function MediaDetailsPage({ params }: MediaDetailsPageProps) {
  const { mediaType, id } = params;
  
  if (mediaType !== "movie" && mediaType !== "tv") {
    notFound();
  }
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    notFound();
  }

  let item;
  try {
    item = await getMediaDetails(numericId, mediaType);
  } catch (error) {
    console.error("Failed to fetch media details:", error);
    notFound();
  }
  
  if (!item) {
    notFound();
  }

  // Manually add media_type to the item object, as it's not in the API response for details
  const itemWithMediaType = { ...item, media_type: mediaType };

  const director = item.credits.crew.find(
    (person) => person.job === "Director"
  );

  const topCast = item.credits.cast.slice(0, 10);

  return (
    <div className="flex flex-col">
      <DetailPageHero item={itemWithMediaType} />

      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 pb-24 space-y-16">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3 text-center">
            <p className="text-muted-foreground text-lg mb-8 max-w-4xl mx-auto">{item.overview}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-8 max-w-2xl mx-auto">
              <div>
                <p className="font-semibold">Rating</p>
                <p className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {item.vote_average.toFixed(1)} / 10
                </p>
              </div>
              {director && (
                <div>
                  <p className="font-semibold">Director</p>
                  <p className="text-muted-foreground">{director.name}</p>
                </div>
              )}
              <div>
                <p className="font-semibold">Runtime</p>
                <p className="text-muted-foreground">
                  {item.runtime ||
                    (item.episode_run_time && item.episode_run_time[0]) ||
                    "N/A"}{" "}
                  mins
                </p>
              </div>
              <div>
                <p className="font-semibold">Genres</p>
                <p className="text-muted-foreground">
                  {item.genres.map((g) => g.name).join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {mediaType === 'tv' && item.number_of_seasons && (
            <EpisodeSelector 
                showId={item.id} 
                numberOfSeasons={item.number_of_seasons} 
                title={item.name || item.title || ''}
            />
        )}

        {topCast.length > 0 && (
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
        )}

        {item.recommendations?.results.length > 0 && (
          <MediaCarousel
            title="More Like This"
            items={item.recommendations.results}
          />
        )}
      </div>
    </div>
  );
}
