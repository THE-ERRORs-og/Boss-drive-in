import { getAllUsers } from "@/lib/actions/user";
import UserLocationsLink from "../components/UserLocationsLink";

export default async function UserLocationAccessPage() {
  const result = await getAllUsers();
  
  return (
    <div className="min-h-screen h-full overflow-auto p-5">
      <div className="flex flex-col max-w-[1200px] mx-auto">
        <h1 className="font-semibold text-3xl p-1 mb-4 mt-4">
          Manage User Location Access
        </h1>
        <div className="max-h-[75vh] mb-4 w-full rounded-md border shadow-inner-lg overflow-y-auto">
          {result.status === "SUCCESS" && result.data.length > 0 ? (
            <div>
              {result.data.map((user, idx) => (
                <UserLocationsLink 
                  key={user._id}
                  idx={idx}
                  user={user}
                />
              ))}
            </div>
          ) : result.status === "SUCCESS" && result.data.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <p className="text-red-500">Error: {result.error || "Failed to load users"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
