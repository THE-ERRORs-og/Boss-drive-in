import SquareButton from "@/components/Button/SquareButton";
import admin_login from "@/public/admin_login.svg";
import staff_login from "@/public/staff_login.svg";

export default function Home() {

 
  return (
    <div className="flex h-screen justify-center items-center">
      {/* Login Options */}
      <div className="flex justify-center items-center gap-12">
        {/* Admin Login */}
        <SquareButton
          text="Login as Admin"
          imageUrl={admin_login}
          redirectUrl="/Login/admin"
        />

        {/* Staff Login */}
        <SquareButton
          text="Login as Staff"
          imageUrl={staff_login}
          redirectUrl="/Login/employee"
        />
      </div>
    </div>
  );
}