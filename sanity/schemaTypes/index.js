import { cash_summary } from "./cashSummary";
import { order_summary } from "./orderSummary";
import { user } from "./user";

export const schema = {
  types: [user, cash_summary, order_summary],
};
