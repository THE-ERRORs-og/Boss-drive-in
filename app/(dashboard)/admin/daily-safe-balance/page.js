import SquareButton from "@/components/Button/SquareButton";
import daily_safe_balance_history from "@/public/daily_safe_balance_history.svg";
import { daily_cash_flow } from "@/public/images";

export default function Page() {
  return (
    <div className="flex h-screen justify-center items-center">
      <div className="flex justify-center items-center gap-12">
        {/* Staff Login */}
        <SquareButton
          text="Safe Balance History"
          imageUrl={daily_safe_balance_history}
          redirectUrl="/employee/daily-safe-balance"
        />
        <SquareButton
          text="Daily Cash Flow"
          imageUrl={daily_cash_flow}
          redirectUrl="/admin/daily-cash-flow"
        />
      </div>
    </div>
  );
}
