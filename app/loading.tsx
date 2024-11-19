import { GridSkeleton } from "@/components/loading-skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted rounded mt-4" />
        </div>
        <GridSkeleton />
      </div>
    </div>
  );
}