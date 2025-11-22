
import { Skeleton } from "@/components/ui/skeleton";

export default function PersonDetailsLoading() {
    return (
        <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12 pb-24 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
                <div className="md:col-span-1 lg:col-span-1">
                    <Skeleton className="relative aspect-[2/3] w-full rounded-lg" />
                </div>
                <div className="md:col-span-2 lg:col-span-3 space-y-4">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-6 w-32 mt-4" />
                    <div className="space-y-2 pt-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            </div>
            
            <div>
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] w-full rounded-md" />
                    ))}
                </div>
            </div>
        </div>
    );
}
