// app/order/page.js
import { client } from "@/sanity/lib/client";
import { ALL_ENABLED_ORDER_ITEMS_QUERY } from "@/sanity/lib/queries";
import OrderForm from "./orderpage";
// import OrderForm from "./OrderForm";

export default async function OrderPage() {
  // Fetch order items from Sanity
  const orderItems = await client
    .withConfig({ useCdn: false })
    .fetch(ALL_ENABLED_ORDER_ITEMS_QUERY);
  const sortedOrderItems = orderItems.sort((a, b) => a.order - b.order);
  
  console.log("orderItems", orderItems);

  const orderData = sortedOrderItems.reduce((acc, item) => {
    acc[item.name] = { boh: "", cashOrder: "", inventory: "" };
    return acc;
  }, {});

  return <OrderForm orderData={orderData} />;
}
