import { cash_summary } from "./cashSummary";
import { constant } from "./constants";
import { order_item } from "./orderItemList";
import { order_summary } from "./orderSummary";
import { safe_balance_history } from "./safeBalanceHistory";
import { user } from "./user";

export const schema = {
  types: [
    user,
    cash_summary,
    order_summary,
    order_item,
    constant,
    safe_balance_history,
  ],
};
