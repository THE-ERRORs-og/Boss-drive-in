"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen px-10">
      {/* Left Section - Input Fields */}
      <div className="flex flex-col w-1/2 space-y-4">
        <Skeleton className="w-40 h-8" /> {/* Back arrow */}
        <Skeleton className="w-60 h-10" /> {/* "Logging in as staff" text */}
        <Skeleton className="w-full h-12 rounded-md" /> {/* Employee ID input */}
        <Skeleton className="w-full h-12 rounded-md" /> {/* Password input */}
        <Skeleton className="w-1/3 h-12 rounded-md" /> {/* Login button */}
      </div>

      {/* Right Section - Image Placeholder */}
      <div className="w-1/2 flex justify-center">
        <Skeleton className="w-96 h-80 rounded-lg" /> {/* Illustration */}
      </div>
    </div>
  );
}
