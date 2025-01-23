'use client';
import { useRouter } from "next/navigation";


const BackButton = () => {
    const router = useRouter();
  return (
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
  );
}

export default BackButton;
