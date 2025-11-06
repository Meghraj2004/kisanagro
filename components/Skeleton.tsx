import { memo } from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

function SkeletonComponent({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-300 rounded ${className}`}
        />
      ))}
    </>
  );
}

const Skeleton = memo(SkeletonComponent);

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <Skeleton className="h-48" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-3" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </div>
    </div>
  );
}

// Dashboard Stats Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-xl animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="h-6 w-32 mb-1" />
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export default Skeleton;