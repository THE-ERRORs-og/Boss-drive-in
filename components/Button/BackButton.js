'use client';
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";


const BackButton = () => {
    const router = useRouter();
  return (
    
    <button
      className="text-black "
      onClick={() => router.back()}
    >
      <ArrowLeft size={64}  strokeWidth={1}/>
    
    </button>
  );
}

export default BackButton;
