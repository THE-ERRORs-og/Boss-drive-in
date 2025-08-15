"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { rolesPriority } from "@/lib/constants";

export default function UserLocationsLink({ user, idx }) {
  const currentUser = useSession();
  const router = useRouter();
  const currUserRole = rolesPriority[currentUser?.user?.role] || 0;
  const userRole = rolesPriority[user.role] || 0;
  
  const handleManageLocations = () => {
    router.push(`/admin/user-location-access/${user.userid}`);
  };

  return (
    <div className="flex flex-col sm:flex-row w-full items-center content-center p-1 gap-2">
      <div className="rounded-lg border-2 w-full sm:w-[74%] p-2">
        <p className="text-lg font-medium truncate">
          {idx + 1}. {user.name} ({user.userid}) - <span className="capitalize">{user.role}</span>
        </p>
      </div>
      <button
        onClick={handleManageLocations}
        disabled={currUserRole < userRole && currentUser.user.id !== user._id}
        className={`w-full sm:w-auto m-1 px-4 py-2 bg-[#ED1C24] text-sm md:text-md text-white rounded-lg font-medium hover:bg-red-600 transition duration-300 ${
          currUserRole < userRole && currentUser.user.id !== user._id
            ? "cursor-not-allowed opacity-50"
            : ""
        }`}
      >
        Manage Locations
      </button>
    </div>
  );
}
