import { Skeleton } from "@/components/ui/skeleton";

export default function CashSummaryLoader() {
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-col px-8 py-2">
        {/* Header Section */}
        <div className="w-full flex justify-between items-center m-4 px-6">
          <Skeleton className="h-6 w-1/3" />
          <div className="flex space-x-4 items-center">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          {/* Input Replacements */}
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>

          {/* Online Tips Section */}
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>

          {/* Total Section */}
          <hr className="my-4 border-gray-300" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-center mt-4">
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    </div>
  );
}
