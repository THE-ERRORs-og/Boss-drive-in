import admin_login from "../../public/admin_login.svg";
import staff_login from "../../public/staff_login.svg";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-screen justify-center items-center">
        {/* Login Options */}
      <div className="flex justify-center items-center gap-12">
        {/* Admin Login */}
        <div className="flex flex-col items-center border-2 border-red-500 rounded-lg p-10 hover:scale-105 transition transform duration-300">
          <Image src={admin_login} alt="Admin Icon" className="w-20 h-20 mb-4" />
          <button className="text-lg font-semibold hover:text-red-500">
            Login as Admin
          </button>
        </div>

        {/* Staff Login */}
        <div className="flex flex-col items-center border-2 border-red-500 rounded-lg p-10 hover:scale-105 transition transform duration-300">
          <Image src={staff_login} alt="Staff Icon" className="w-20 h-20 mb-4" />
          <button className="text-lg font-semibold hover:text-red-500">
            Login as Staff
          </button>
        </div>
      </div>
    </div>
  );
}