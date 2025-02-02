import { auth, signOut } from "@/auth";
import BackButton from "../Button/BackButton";
import { LogOut } from "lucide-react";

export default async function NavbarWithBackButton() {
  const session = await auth();

  return (
    <nav className="h-20 w-full bg-white flex justify-between items-center px-8 py-8 ">
      <BackButton />
      <img
        src="/logo.png" // Replace this with your logo's path
        alt="Boss Drive-In"
        className="h-12 mx-auto"
      />
      {session && session.user && (
        <LogOut
        size={48}  strokeWidth={1}
          onClick={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        />
      )}
    </nav>
  );
}
