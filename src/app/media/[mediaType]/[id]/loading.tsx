
import { Skeleton } from "@/components/ui/skeleton";

export default function MediaDetailsLoading() {
  return (
      <div className="flex flex-col">
          {/* Skeleton for Hero */}
          <Skeleton className="w-full h-[60vh] lg:h-[85vh] bg-muted" />

          <div className="container mx-auto px-4 md:px-8 lg:px-16 space-y-12 py-12 pb-24">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-3 text-center space-y-6">
                      <Skeleton className="h-6 w-3/4 mx-auto" />
                      <Skeleton className="h-16 w-full max-w-4xl mx-auto" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                      </div>
                  </div>
              </div>

              {/* Skeleton for Cast */}
              <div className="mt-12">
                  <Skeleton className="h-8 w-48 mx-auto mb-6" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
                      {Array.from({ length: 10 }).map((_, i) => (
                           <div key={i}>
                            <Skeleton className="relative aspect-[2/3] rounded-lg mb-2" />
                            <Skeleton className="h-4 w-3/4 mx-auto" />
                            <Skeleton className="h-3 w-1/2 mx-auto mt-1" />
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  )
}
