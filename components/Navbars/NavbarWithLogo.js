import Link from "next/link";

export default function NavbarWithLogo() {
  return (
    <nav className="h-16 w-full bg-white flex justify-center items-center shadow-md">
      <Link href="/">
        <img
          src="/logo.png" // Replace this with your logo's path
          alt="Boss Drive-In"
          className="h-10"
        />
      </Link>
    </nav>
  );
}
