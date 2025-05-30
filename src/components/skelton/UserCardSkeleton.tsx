import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";

export function UserCardSkeleton() {
  return (
    <Card className="overflow-hidden transition-all w-full border-[1px] border-[#737373] py-3">
      <CardContent className="px-4">
        <div className="flex items-center gap-4">
          {/* Avatar skeleton */}
          <div className="flex-shrink-0">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          
          <div className="flex-grow">
            {/* Name and username skeleton */}
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            
            {/* Bio skeleton */}
            <div className="mb-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5 mt-1" />
            </div>
            
            {/* Stats skeleton */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          
          {/* Button skeleton */}
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
