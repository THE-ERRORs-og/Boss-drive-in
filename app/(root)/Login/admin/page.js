import { auth } from "@/auth";
import AdminLoginForm from "@/components/LoginForm/AdminForm";
import { redirect } from "next/navigation";
import admin_avatar from "@/public/admin_avatar.png";
import Image from "next/image";

export default async function Page() {
  const session = await auth();

  if (session && session.user && session.user.role === "admin")
    redirect("/admin");
  
  return (
    <div className="h-screen flex flex-col">
      {/* Content */}
      <div className="flex flex-1 items-center justify-between px-10">
        {/* Left Section */}
        <AdminLoginForm />

        {/* Right Section */}
        <div className="w-1/2 flex justify-center">
          <Image
            src={admin_avatar}
            alt="Staff Illustration"
            className="w-4/5"
          />
        </div>
      </div>
    </div>
  );
}
