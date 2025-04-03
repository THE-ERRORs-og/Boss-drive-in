// app/order/page.js
"use client";
import { client } from "@/sanity/lib/client";
import { ALL_ENABLED_ORDER_ITEMS_QUERY } from "@/sanity/lib/queries";
import OrderForm from "./orderpage";
import SquareButton from "@/components/Button/SquareButton";
import { useRouter } from "next/navigation";
// import OrderForm from "./OrderForm";

export default function OrderPage() {
  // // Fetch order items from Sanity
  // const orderItems = await client
  //   .withConfig({ useCdn: false })
  //   .fetch(ALL_ENABLED_ORDER_ITEMS_QUERY);
  // const sortedOrderItems = orderItems.sort((a, b) => a.order - b.order);

  // console.log("orderItems", orderItems);

  // const orderData = sortedOrderItems.reduce((acc, item) => {
  //   acc[item.name] = { boh: "", cashOrder: "", inventory: "" };
  //   return acc;
  // }, {});

  // return <OrderForm orderData={orderData} />;
  const router = useRouter();

  return (
    <div className="flex h-screen justify-center items-center px-4">
      <div className="flex flex-wrap justify-center items-center gap-8 w-full max-w-8xl">
        <button
          onClick={() => router.push("/employee/order-process/sysco")}
          className="w-60 h-60 text-lg flex flex-col items-center justify-center font-semibold border-2 border-red-500 rounded-lg p-10 hover:scale-105 transition transform duration-300 hover:text-red-500"
        >
          SYSCO
        </button>

        <button
          onClick={() =>
            router.push("/employee/order-process/restaurant-depot")
          }
          className="w-60 h-60  text-lg flex flex-col items-center justify-center font-semibold border-2 border-red-500 rounded-lg p-10 hover:scale-105 transition transform duration-300 hover:text-red-500"
        >
          RESTAURANT DEPOT
        </button>

        <button
          onClick={() => router.push("/employee/order-process/uschef")}
          className="w-60 h-60  text-lg flex flex-col items-center justify-center font-semibold border-2 border-red-500 rounded-lg p-10 hover:scale-105 transition transform duration-300 hover:text-red-500"
        >
          USCHEF
        </button>

        <button
          onClick={() =>
            router.push("/employee/order-process/special-online-order")
          }
          className="w-60 h-60  text-lg flex flex-col items-center justify-center font-semibold border-2 border-red-500 rounded-lg p-10 hover:scale-105 transition transform duration-300 hover:text-red-500"
        >
          SPECIAL ONLINE ORDER
        </button>
      </div>
    </div>
  );
}
