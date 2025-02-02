import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col items-center w-screen p-6">
      {/* Header Skeleton */}
      <div className="flex justify-between w-full max-w-2xl mb-4">
        <Skeleton className="w-28 h-6" />
        <Skeleton className="w-28 h-6" />
        <Skeleton className="w-40 h-6" />
        <Skeleton className="w-20 h-6" />
      </div>

      {/* Order List Skeleton */}
      <div className="w-full max-w-2xl border-2 border-black rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          <Skeleton className="w-40 h-8 mx-auto" />
        </h2>

        {/* Table Header */}
        <div className="grid grid-cols-4 font-semibold text-center mb-4">
          <Skeleton className="h-6 w-20 mx-auto" />
          <Skeleton className="h-6 w-20 mx-auto" />
          <Skeleton className="h-6 w-20 mx-auto" />
          <Skeleton className="h-6 w-20 mx-auto" />
        </div>

        {/* Table Rows */}
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-4 items-center text-center border-t py-2"
          >
            <Skeleton className="h-6 w-24 mx-auto" />
            <Skeleton className="h-10 w-20 rounded-lg mx-auto" />
            <Skeleton className="h-10 w-20 rounded-lg mx-auto" />
            <Skeleton className="h-10 w-20 rounded-lg mx-auto" />
          </div>
        ))}
      </div>

      {/* Download Button Skeleton */}
      <Skeleton className="w-48 h-12 mt-6 rounded-lg" />
    </div>
  );
}
