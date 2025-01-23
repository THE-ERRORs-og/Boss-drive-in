import Image from "next/image";
import {employee_order_process , daily_cash_summary , daily_safe_balance} from "../../../public/images";
export default function Page() {
  return (
    <div>
      {/* <h1>Route: /employee</h1> */}
      <div className="flex h-screen justify-center items-center">
        {/* Login Options */}
      <div className="flex justify-center items-center gap-12">
        {/* Admin Login */}
        <div className="flex flex-col items-center border-2 border-red-500 rounded-lg p-10 hover:scale-105 transition transform duration-300">
          <Image src={daily_cash_summary} alt="Admin Icon" className="w-20 h-20 mb-4" />
          <button className="text-lg font-semibold hover:text-red-500">
            Daily Cash Summary
          </button>
        </div>

        {/* Staff Login */}
        <div className="flex flex-col items-center border-2 border-red-500 rounded-lg p-10 hover:scale-105 transition transform duration-300">
          <Image src={daily_safe_balance} alt="Staff Icon" className="w-20 h-20 mb-4" />
          <button className="text-lg font-semibold hover:text-red-500">
            Daily Safe Balance
          </button>
        </div>

        <div className="flex flex-col items-center border-2 border-red-500 rounded-lg p-10 hover:scale-105 transition transform duration-300">
          <Image src={employee_order_process} alt="Staff Icon" className="w-20 h-20 mb-4" />
          <button className="text-lg font-semibold hover:text-red-500">
            Employee Order Process
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
