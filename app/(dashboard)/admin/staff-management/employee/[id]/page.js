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

      <Link
        href={`/admin/staff-management/employee/${employee.userid}/edit`}
        className="text-blue-boss font-bold text-lg"
      >
        Forgot Password ?
      </Link>
      <p>Last Login</p>

      <div className="flex gap-4">
        <div className="text-center mt-4 w-[20vw] px-6 py-2 text-white rounded-lg font-medium bg-red-600 transition duration-300">
          {employee.lastLogin ? new Date(employee.lastLogin).toLocaleString() : "Not Available"}
        </div>
      </div>
    </div>
  );
}
