import { client } from "@/sanity/lib/client";
import { ORDER_SUMMARY_BY_ID_QUERY } from "@/sanity/lib/queries";
import DownloadButton from "./DownloadButton";

export default async function Page({ params }) {
  const { id } = await params;
  const orderDetails = await client.fetch(ORDER_SUMMARY_BY_ID_QUERY, { id });
  const date = new Date(orderDetails.date);

  // Format Date: "11/Feb/2025"
  const dateStr =
    date.getDate().toString().padStart(2, "0") +
    "/" +
    date.toLocaleString("en-US", { month: "short" }) +
    "/" +
    date.getFullYear();

    console.log(orderDetails);
  // // Format Time: "12:00 PM"
  // const time = date
  //   .toLocaleString("en-US", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     hour12: true,
  //   })
  //   .replace(/^0/, "");

  return (
    <div className="flex flex-col items-center w-screen p-6">
      <div className="text-center mb-6 flex flex-col items-center w-full">
        <div className="flex justify-between w-full text-xl font-semibold border-b pb-2">
          <p>
            <span className="font-bold">Date :</span> {dateStr}
          </p>
          {/* <p>
            <span className="font-bold">Time :</span> {time}
          </p> */}
          <p>
            <span className="font-bold">Ordered by :</span>{" "}
            {orderDetails.createdBy.name}
          </p>
          <p>
            <span className="font-bold">Shift Number :</span>{" "}
            {orderDetails.shiftNumber}
          </p>
        </div>
      </div>

      <div className="w-full border rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Order List</h2>
        <div className="grid grid-cols-4 gap-4 text-center font-semibold mb-4">
          <p className="font-bold"></p>
          <p className="font-bold">BOH</p>
          <p className="font-bold">Cash Order</p>
          <p className="font-bold">Inventory</p>
        </div>
        {orderDetails.items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-4 gap-4 text-center items-center py-2 border-b"
          >
            <p className="font-semibold">{item.itemName}</p>
            <div className="border rounded-lg px-4 py-2 bg-gray-100">
              {item.boh}
            </div>
            <div className="border rounded-lg px-4 py-2 bg-gray-100">
              {item.cashOrder}
            </div>
            <div className="border rounded-lg px-4 py-2 bg-gray-100">
              {item.inventory}
            </div>
          </div>
        ))}
      </div>

      <DownloadButton orderDetails={orderDetails} />
    </div>
  );
}
