import { Squada_One } from "next/font/google";
import SquareButton from "@/components/Button/SquareButton";
import { view_order_history, edit_order_list } from "@/public/images";

export default function Page() {
  return (
    <div className="flex justify-center items-center h-screen gap-10">
      {/* <h1>Route: /admin/employee-order-history</h1> */}
      <SquareButton text="Edit Order List" imageUrl={edit_order_list} />
      <SquareButton text="View Order List" imageUrl={view_order_history} />
    </div>
  );
}
