// app/order/page.js
import { client } from "@/sanity/lib/client";
import { ALL_ORDER_ITEMS_QUERY } from "@/sanity/lib/queries";
import OrderForm from "./orderpage";
// import OrderForm from "./OrderForm";

export default async function OrderPage() {
  // Fetch order items from Sanity
  const orderItems = await client.fetch(ALL_ORDER_ITEMS_QUERY);

  // Transform the fetched data into the required structure
  const orderData = orderItems.reduce((acc, item) => {
    acc[item.name] = { boh: "", cashOrder: "", inventory: "" };
    return acc;
  }, {});

  return <OrderForm orderData={orderData} />;
}
