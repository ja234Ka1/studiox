
'use client';

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const platforms = [
  { name: "Prime Video", logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Prime_Video_logo_%282024%29.svg" },
  { name: "HBO", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b3/HBO_Max_%282025%29.svg" },
  { name: "Apple TV+", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Apple_TV_logo.svg" },
  { name: "Hulu", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Hulu_logo_%282018%29.svg" },
  { name: "Paramount+", logo: "https://upload.wikimedia.org/wikipedia/commons/3/35/Paramount_Plus.svg_%281%29.png" },
  { name: "Tubi", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Tubi_logo_2024_purple.svg" },
  { name: "NBC", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/NBC_logo.svg" },
  { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Netflix_2015_N_logo.svg" },
  { name: "Disney+", logo: "https://upload.wikimedia.org/wikipedia/commons/7/77/Disney_Plus_logo.svg" },
  { name: "Crunchyroll", logo: "https://upload.wikimedia.org/wikipedia/commons/8/85/Crunchyroll_2024_stacked.svg" },
];

export default function PlatformCarousel() {
    const plugin = React.useRef(
        Autoplay({ delay: 2000, stopOnInteraction: true })
    );

  return (
    <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-bold text-center text-white mb-8">
                All Your Favorite Platforms In One Place
            </h2>
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                    dragFree: true,
                }}
                plugins={[plugin.current]}
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                {platforms.map((platform, index) => (
                    <CarouselItem
                        key={index}
                        className="basis-1/3 sm:basis-1/4 md:basis-1/6 lg:basis-1/8"
                    >
                        <div className="p-1">
                            <div className="group relative flex h-24 items-center justify-center rounded-lg border-2 border-transparent bg-card/50 p-6 transition-all duration-300 hover:border-primary/50">
                                <Image
                                    src={platform.logo}
                                    alt={platform.name}
                                    fill
                                    className="object-contain p-2 transition-all duration-300 dark:invert group-hover:dark:invert-0"
                                />
                            </div>
                        </div>
                    </CarouselItem>
                ))}
                </CarouselContent>
            </Carousel>
        </div>
    </section>
  );
}
