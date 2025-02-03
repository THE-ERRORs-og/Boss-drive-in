import {
  employee_order_process,
  daily_cash_summary,
  daily_safe_balance,
} from "@/public/images";
import SquareButton from "@/components/Button/SquareButton";

export default function Page() {
  return (
    <div className="flex h-screen justify-center items-center px-4">
      <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-12 max-w-4xl">
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
  );
}
