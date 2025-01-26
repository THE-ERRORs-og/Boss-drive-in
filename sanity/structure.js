// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure = (S) =>
  S.list()
    .title("Content")
    .items([S.documentTypeListItem("user").title("Users"),
    S.documentTypeListItem("cash_summary").title("Cash Summary"),
    S.documentTypeListItem("order_summary").title("Order Summary"),
    S.documentTypeListItem("order_item").title("Order Item"),
    ]);
