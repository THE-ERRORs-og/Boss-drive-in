import { client } from "@/sanity/lib/client";
import { USER_DATA_QUERY} from "@/sanity/lib/queries";
import Link from "next/link";

export default async function Page({ params }) {
    const { id:userid} = await params;

    const employee = await client
      .withConfig({ useCdn: false })
      .fetch(USER_DATA_QUERY, { userid });
    // console.log(employee);
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen text-xl  gap-2">
      {/* <h1>Route: /admin/staff-management/employee</h1> */}
      <div className="flex justify-between items-center gap-10 w-[50vw]">
        <h1 className="font-semibold">Employee ID :</h1>
        <div
          type="text"
          className="border-2 border-gray-300 p-2 rounded-md w-[30vw] h-[60] font-semibold text-2xl justify-center items-center flex"
        >
          {userid}
        </div>
      </div>
      <div className="flex justify-between items-center gap-10 w-[50vw]">
        <h1 className="font-semibold">Employee Name :</h1>
        <div
          type="text"
          className="border-2 border-gray-300 p-2 rounded-md w-[30vw] h-[60] font-semibold text-2xl justify-center items-center flex"
        >
          {employee?.name}
        </div>
      </div>
      <div className="flex justify-between items-center gap-10 w-[50vw]">
        <h1 className="font-semibold">Employee Password :</h1>
        <div
          type="text"
          className="border-2 border-gray-300 p-2 rounded-md w-[30vw] h-[60] font-semibold text-2xl justify-center items-center flex"
        >
          {employee?.password}
        </div>
      </div>

      <Link
        href="/admin/staff-management/employee/shivamjvm/edit"
        className="text-blue-boss font-bold text-lg"
      >
        Forgot Password ?
      </Link>
      <p>Last Login</p>

      <div className="flex gap-4">
        <div
          // onClick={closePopup}
          className="text-center mt-4 w-[20vw] px-6 py-2 text-white rounded-lg font-medium bg-red-600 transition duration-300"
        >
          {employee?.lastLogin ? new Date(employee?.lastLogin).toLocaleString() : "Not Available"}
        </div>
      </div>
    </div>
  );
}
