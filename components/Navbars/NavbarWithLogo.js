export default function NavbarWithLogo() {
  return (
    <nav className="h-16 w-full bg-white flex justify-center items-center shadow-md">
      <img
        src="/logo.png" // Replace this with your logo's path
        alt="Boss Drive-In"
        className="h-10"
      />
    </nav>
  );
}
