import { Skeleton } from "../ui/skeleton";

export function RepositoryCardSkeleton() {
  return (
    <div className="flex items-start p-4 rounded-lg border border-gray-700 bg-gray-800 space-x-4">
      {/* Avatar skeleton */}
      <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
      
      <div className="flex-1 space-y-3">
        {/* Title skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-3/5 bg-gray-700" />
          <Skeleton className="h-8 w-8 rounded-md bg-gray-700" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full bg-gray-700" />
          <Skeleton className="h-3 w-4/5 bg-gray-700" />
        </div>
        
        {/* Stats skeleton */}
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-16 bg-gray-700" />
          <Skeleton className="h-4 w-16 bg-gray-700" />
          <Skeleton className="h-4 w-16 bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
