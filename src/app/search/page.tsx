
import { Suspense } from 'react';
import SearchClient from '@/components/search-client';
import { Skeleton } from '@/components/ui/skeleton';

function SearchSkeleton() {
    return (
        <div className="container px-4 md:px-8 lg:px-16 space-y-8 py-12 pb-24 mx-auto">
            <div className="relative w-full max-w-xl mx-auto">
                <Skeleton className="w-full h-12 rounded-full" />
            </div>
            <div className="text-center pt-8">
                <Skeleton className="h-8 w-64 mx-auto mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchSkeleton />}>
            <SearchClient />
        </Suspense>
    );
}
