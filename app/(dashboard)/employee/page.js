import {
  employee_order_process,
  daily_cash_summary,
  daily_safe_balance,
} from "@/public/images";
import SquareButton from "@/components/Button/SquareButton";

export default function Page() {
  return (
    <div>
      <div className="flex h-screen justify-center items-center">
        <div className="flex justify-center items-center gap-12">
          <SquareButton
            text="Daily Cash Summary"
            imageUrl={daily_cash_summary}
            redirectUrl="/employee/daily-cash-summary"
          />

          <SquareButton
            text="Daily Safe Balance"
            imageUrl={daily_safe_balance}
            redirectUrl="/employee/daily-safe-balance"
          />

          <SquareButton
            text="Employee Order Process"
            imageUrl={employee_order_process}
            redirectUrl="/employee/order-process"
          />
        </div>
      </div>
    </div>
  );
}
