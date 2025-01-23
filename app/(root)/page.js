"use client";
import SquareButton from "@/components/Button/SquareButton";
import admin_login from "@/public/admin_login.svg";
import staff_login from "@/public/staff_login.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function Home() {
  const router = useRouter();

 
  return (
    <div className="flex h-screen justify-center items-center">
        {/* Login Options */}
      <div className="flex justify-center items-center gap-12">
        {/* Admin Login */}
        <SquareButton text="Login as Admin" imageUrl ={admin_login} onClick={()=>router.push("/Login/admin")} />

        {/* Staff Login */}
        <SquareButton text="Login as Staff" imageUrl ={staff_login} onClick={()=>router.push("/Login/employee")}/>
      </div>
    </div>
  );
}