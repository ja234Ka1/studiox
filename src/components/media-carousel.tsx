
import type { Media } from "@/types/tmdb";
import { MediaCard } from "./media-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface MediaCarouselProps {
  title: string;
  items: Media[];
}

export default function MediaCarousel({ title, items }: MediaCarouselProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4 py-12">
          {items.map((item, index) => (
            <CarouselItem
              key={`${item.id}-${index}`}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4"
            >
              <MediaCard item={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
}
