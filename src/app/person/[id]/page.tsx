
import { notFound } from "next/navigation";
import Image from "next/image";
import { getPersonDetails } from "@/lib/tmdb";
import { getTmdbImageUrl } from "@/lib/utils";
import { format } from "date-fns";
import MediaCarousel from "@/components/media-carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  params: {
    id: string;
  };
};

export default async function PersonDetailsPage({ params }: Props) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    notFound();
  }

  let person;
  try {
    person = await getPersonDetails(id);
  } catch (error) {
    console.error("Failed to fetch person details:", error);
    notFound();
  }
  
  const knownForItems = person.combined_credits.cast.slice(0, 20);

  const getAge = (birthDate: string, deathDate: string | null) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  }

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 pb-24 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
            <div className="md:col-span-1 lg:col-span-1">
                <Card className="overflow-hidden">
                  <div className="relative aspect-[2/3] bg-muted">
                    <Image
                        src={getTmdbImageUrl(person.profile_path, 'w500')}
                        alt={person.name}
                        fill
                        className="object-cover"
                        priority
                    />
                   </div>
                </Card>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2">{person.name}</h1>
                <div className="text-muted-foreground text-sm mb-6">
                    {person.birthday && (
                        <span>
                            Born {format(new Date(person.birthday), "MMMM d, yyyy")}
                            {person.place_of_birth ? ` in ${person.place_of_birth}` : ''}
                            {' '}({person.deathday ? `died at age ${getAge(person.birthday, person.deathday)}` : `age ${getAge(person.birthday, null)}`})
                        </span>
                    )}
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold border-b pb-2">Biography</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {person.biography || "No biography available."}
                    </p>
                </div>
            </div>
        </div>
        
        {knownForItems.length > 0 && (
            <MediaCarousel title="Known For" items={knownForItems} />
        )}
    </div>
  );
}
