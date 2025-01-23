import { auth, signOut } from "@/auth";
import BackButton from "../Button/BackButton";

export default async function NavbarWithBackButton() {
  const session = await auth();

  return (
    <nav className="h-16 w-full bg-white flex justify-between items-center px-4 py-4 shadow-md">
      <BackButton/>
      <img
        src="/logo.png" // Replace this with your logo's path
        alt="Boss Drive-In"
        className="h-10 mx-auto"
      />
      {session && session.user && (
        <button onClick={async ()=>{
          'use server';
          await signOut({redirectTo :"/"});
        }}>Logout</button>)}
    </nav>
  );
}
