import { auth } from "@/auth";
import EmployeeLoginForm from "@/components/LoginForm/EmpForm";
import { redirect } from "next/navigation";
import staff_illu from "@/public/staff_illu.svg";
import Image from "next/image";

export default async function Page() {
  const session = await auth();
  if (session && session.user) redirect("/employee");
  
  return (
    <div className="h-screen flex flex-col">
      {/* Content */}
      <div className="flex flex-1 items-center justify-between px-10">
        {/* Left Section */}
        <EmployeeLoginForm />

        {/* Right Section */}
        <div className="w-1/2 flex justify-center">
          <Image src={staff_illu} alt="Staff Illustration" className="w-4/5" />
        </div>
      </div>
    </div>
  );
}
