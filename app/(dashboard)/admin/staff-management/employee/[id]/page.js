import { Button } from "@/components/ui/button";

export default function Page({}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen text-xl  gap-2">
      {/* <h1>Route: /admin/staff-management/employee</h1> */}
      <h1 className="font-semibold">Employee ID *</h1>
      <input
        type="text"
        className="border-2 border-gray-300 p-2 rounded-md w-[40vw]"
        placeholder="Enter Employee ID"
      />
      <p className="text-blue-boss font-bold text-lg">Forgot Password ?</p>
      <p>Last Login</p>

      <div className="flex gap-4">
      <button
                // onClick={closePopup}
                className="mt-4 w-[20vw] px-6 py-2 bg-brown-boss text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
              >
                9:00 AM
      </button>
      <button
                // onClick={closePopup}
                className="mt-4 w-[20vw] px-6 py-2 bg-brown-boss text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
              >
                Shift 3
      </button>

      </div>
    </div>
  );
}
