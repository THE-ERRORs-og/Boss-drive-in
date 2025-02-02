import { auth } from "@/auth";
import NavbarWithBackButton from "@/components/Navbars/NavbarWithBackButton";
import { SessionProvider } from "@/context/SessionContext"; // Adjust the path as needed
import { redirect } from "next/navigation";
import React from "react";

const Layout = async ({ children }) => {
  const session = await auth();
  if(!session || !session.user || session.user.role !=="admin") redirect("/Login/admin");
  return (
    <>
      {children}
    </>
  );
};

export default Layout;
