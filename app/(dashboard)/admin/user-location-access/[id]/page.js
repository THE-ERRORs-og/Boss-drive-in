import UserLocationManager from "./components/UserLocationManager";
import { getUserById } from "@/lib/actions/user";

export default async function UserLocationPage({ params }) {
  const { id: userid } = await params;
  const result = await getUserById(userid);

  if (result.status === "ERROR") {
    return (
      <div className="min-h-screen p-8 overflow-auto">
        <div className="mt-8 flex justify-center items-center">
          <div className="text-red-600 font-semibold text-xl">
            {result.error || "Failed to load user details"}
          </div>
        </div>
      </div>
    );
  }

  const user = result.data;

  return (
    <div className="min-h-screen overflow-auto p-8">
      <div className="mt-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Manage Location Access for {user.name}
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <span className="font-semibold text-gray-700 w-28">User ID:</span>
              <span className="px-3 py-2 bg-gray-100 rounded-md flex-1">{user.userid}</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <span className="font-semibold text-gray-700 w-28">Name:</span>
              <span className="px-3 py-2 bg-gray-100 rounded-md flex-1">{user.name}</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <span className="font-semibold text-gray-700 w-28">Role:</span>
              <span className="px-3 py-2 bg-gray-100 rounded-md flex-1 capitalize">{user.role}</span>
            </div>
          </div>
        </div>
        
        {user.role === "superadmin" ? (
          <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
            <p className="text-xl font-medium text-blue-800">
              Superadmins automatically have access to all locations.
            </p>
          </div>
        ) : (
          <UserLocationManager 
            user={user}
          />
        )}
      </div>
    </div>
  );
}
