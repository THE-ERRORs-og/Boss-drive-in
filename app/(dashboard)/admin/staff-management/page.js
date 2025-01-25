import SquareButton from "@/components/Button/SquareButton";
import { edit_staff, add_staff_member } from "@/public/images";
export default function Page() {
  return (
    <div className="flex h-screen justify-center items-center">
      {/* Login Options */}
      <div className="flex justify-center items-center gap-12">
        {/* Admin Login */}
        <SquareButton
          text="Add Staff Member"
          imageUrl={add_staff_member}
          redirectUrl="/Login/admin"
        />

        {/* Staff Login */}
        <SquareButton
          text="Edit Staff Member"
          imageUrl={edit_staff}
          redirectUrl="/Login/employee"
        />
        {/* <SquareButton
        text="Employee Order History"
        imageUrl={employee_order_history}
        redirectUrl="/Login/employee"
      /> */}
      </div>
    </div>
  );
}
