import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Add base skeleton component for reusability
interface SkeletonBaseProps {
  className?: string;
  count?: number;
  children: React.ReactNode;
}

function SkeletonBase({ className, count = 1, children }: SkeletonBaseProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("animate-pulse", className)}>
          {children}
        </div>
      ))}
    </>
  );
}

// Enhanced ProfileSkeleton with customization options
interface ProfileSkeletonProps {
  showAvatar?: boolean;
  lines?: number;
  className?: string;
}

export function ProfileSkeleton({ showAvatar = true, lines = 3, className }: ProfileSkeletonProps) {
  return (
    <Card className={cn("p-6 space-y-6", className)}>
      <div className="flex items-center space-x-4">
        {showAvatar && <Skeleton className="h-16 w-16 rounded-full" />}
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn("h-4", {
              'w-full': i === 0,
              'w-3/4': i === 1,
              'w-1/2': i === 2,
            })} 
          />
        ))}
      </div>
    </Card>
  );
}

// Enhanced ShiftCardSkeleton with customization
interface ShiftCardSkeletonProps {
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export function ShiftCardSkeleton({ 
  showHeader = true, 
  showFooter = true, 
  className 
}: ShiftCardSkeletonProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {showHeader && (
          <div className="flex justify-between">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-6 w-[100px]" />
          </div>
        )}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {showFooter && (
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
        )}
      </div>
    </Card>
  );
}

// Enhanced GridSkeleton with more options
interface GridSkeletonProps {
  count?: number;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  gap?: string;
  className?: string;
}

export function GridSkeleton({ 
  count = 6,
  columns = {
    default: 1,
    md: 2,
    lg: 3
  },
  gap = "gap-4",
  className
}: GridSkeletonProps) {
  return (
    <div className={cn(
      "grid",
      `grid-cols-${columns.default}`,
      `md:grid-cols-${columns.md}`,
      `lg:grid-cols-${columns.lg}`,
      gap,
      className
    )}>
      <SkeletonBase count={count}>
        <ShiftCardSkeleton />
      </SkeletonBase>
    </div>
  );
}