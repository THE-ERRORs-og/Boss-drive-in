import SquareButton from "@/components/Button/SquareButton";
import { staff_management , daily_safe_balance , employee_order_process} from "@/public/images";

export default function Page() {
  return (
    <div>
      {/* <h1>Route: /admin</h1> */}
      <div>
        <div className="flex h-screen justify-center items-center">
          <div className="flex justify-center items-center gap-12">
            <SquareButton imageUrl={staff_management} text={"Staff Management"} redirectUrl=""/>
            <SquareButton imageUrl={daily_safe_balance} text={"Daily Safe Balance History"} redirectUrl=""/>
            <SquareButton imageUrl={employee_order_process} text={"Employee Order Process"} redirectUrl=""/>
          </div>
        </div>
      </div>
    </div>
  );
}
