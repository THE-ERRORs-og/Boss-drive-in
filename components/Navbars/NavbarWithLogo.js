import Link from "next/link";

export default function NavbarWithLogo() {
  return (
    <nav className="h-20 w-full bg-white flex justify-center items-center px-8 py-8">
      <Link href="/">
        <img
          src="/logo.png" // Replace this with your logo's path
          alt="Boss Drive-In"
          className="h-12 mx-auto"
        />
      </Link>
    </nav>
  );
}
