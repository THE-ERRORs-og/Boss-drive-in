import { getOrderById } from "@/lib/actions/orderHistory";
import OrderDetailView from "../../view/[id]/OrderDetailView";

export default async function RestaurantDepotOrderDetail({ params }) {
  const { id } = await params;
  const result = await getOrderById("restaurant-depot", id);

  if (result.status !== "SUCCESS") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-xl">Error loading order details</p>
      </div>
    );
  }

  return <OrderDetailView orderDetails={result.data} />;
} 