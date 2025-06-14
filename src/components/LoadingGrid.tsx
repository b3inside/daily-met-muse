
import { cn } from "@/lib/utils";

interface LoadingGridProps {
  count?: number;
}

const LoadingGrid = ({ count = 5 }: LoadingGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "bg-white rounded-xl shadow-lg overflow-hidden animate-pulse",
            index === 0 && "md:col-span-2 lg:col-span-1"
          )}
        >
          <div className="aspect-[4/5] bg-gradient-to-br from-gray-200 to-gray-300" />
          <div className="p-6 space-y-3">
            <div className="h-6 bg-gray-200 rounded-md w-3/4" />
            <div className="h-4 bg-gray-200 rounded-md w-1/2" />
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-200 rounded-md w-1/4" />
              <div className="h-6 bg-gray-200 rounded-full w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingGrid;
