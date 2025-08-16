import { getUserById } from "@/lib/actions/user";
import Link from "next/link";

export default async function Page({ params }) {
    const { id:userid} = await params;

  const result = await getUserById(userid);
  
  if (result.status === "ERROR") {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen text-xl gap-2">
        <div className="text-red-600 font-semibold">
          {result.error}
        </div>
      </div>
    );
  }

  const employee = result.data;
  const isSuperadmin = employee.role === "superadmin";

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen text-xl gap-2">
      {/* <h1>Route: /admin/staff-management/employee</h1> */}
      <div className="flex justify-between items-center gap-10 w-[50vw]">
        <h1 className="font-semibold">Employee ID :</h1>
        <div
          type="text"
          className="border-2 border-gray-300 p-2 rounded-md w-[30vw] h-[60] font-semibold text-2xl justify-center items-center flex"
        >
          {employee.userid}
        </div>
      </div>
      <div className="flex justify-between items-center gap-10 w-[50vw]">
        <h1 className="font-semibold">Employee Name :</h1>
        <div
          type="text"
          className="border-2 border-gray-300 p-2 rounded-md w-[30vw] h-[60] font-semibold text-2xl justify-center items-center flex"
        >
          {employee.name}
        </div>
      </div>
      <div className="flex justify-between items-center gap-10 w-[50vw]">
        <h1 className="font-semibold">Employee Password :</h1>
        <div
          type="text"
          className="border-2 border-gray-300 p-2 rounded-md w-[30vw] h-[60] font-semibold text-2xl justify-center items-center flex"
        >
          {employee.password}
        </div>
      </div>
      <div className="flex justify-between items-center gap-10 w-[50vw]">
        <h1 className="font-semibold">Role :</h1>
        <div
          type="text"
          className="border-2 border-gray-300 p-2 rounded-md w-[30vw] h-[60] font-semibold text-2xl justify-center items-center flex capitalize"
        >
          {employee.role}
        </div>
      </div>

      <div className="flex justify-between items-center gap-10 w-[50vw]">
        <h1 className="font-semibold">Location Access :</h1>
        <div
          type="text"
          className="border-2 border-gray-300 p-2 rounded-md w-[30vw] font-semibold text-xl justify-center items-center flex"
        >
          {isSuperadmin ? (
            <span>All Locations (Superadmin)</span>
          ) : employee.locationAccess && employee.locationAccess.length > 0 ? (
            <ul className="list-disc list-inside text-left">
              {employee.locationAccess.map(location => (
                <li key={location._id}>{location.name}</li>
              ))}
            </ul>
          ) : (
            <span>No locations assigned</span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Link
          href={`/admin/staff-management/employee/${employee.userid}/edit`}
          className="text-blue-boss font-bold text-lg"
        >
          Forgot Password ?
        </Link>
        
        <Link
          href={`/admin/user-location-access/${employee.userid}`}
          className="text-blue-boss font-bold text-lg"
        >
          Manage Location Access
        </Link>
      </div>
      
      <p>Last Login</p>

      <div className="flex gap-4">
        <div className="text-center mt-4 w-[20vw] px-6 py-2 text-white rounded-lg font-medium bg-red-600 transition duration-300">
          {employee.lastLogin ? new Date(employee.lastLogin).toLocaleString() : "Not Available"}
        </div>
      </div>
    </div>
  );
}
