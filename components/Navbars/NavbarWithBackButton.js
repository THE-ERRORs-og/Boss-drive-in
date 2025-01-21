"use client";
import { useRouter } from "next/navigation";

export default function NavbarWithBackButton() {
  const router = useRouter();

  return (
    <nav className="h-16 w-full bg-white flex justify-between items-center px-4 shadow-md">
      <button
        className="flex items-center space-x-2 text-gray-700"
        onClick={() => router.back()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Back</span>
      </button>
      <img
        src="/logo.png" // Replace this with your logo's path
        alt="Boss Drive-In"
        className="h-10 mx-auto"
      />
    </nav>
  );
}
