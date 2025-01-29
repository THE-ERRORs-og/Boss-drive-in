// import jsPDF from "jspdf";

export default function Page() {
  const orderDetails = {
    date: "11/Feb/2025",
    time: "12:00 PM",
    orderedBy: "Pratham Verma",
    shiftNumber: 3,
    items: [
      { name: "Napkin", boh: "$XX", cashOrder: "$XX", inventory: "$XX" },
      { name: "Cup", boh: "$XX", cashOrder: "$XX", inventory: "$XX" },
      { name: "Candy", boh: "$XX", cashOrder: "$XX", inventory: "$XX" },
      { name: "Water", boh: "$XX", cashOrder: "$XX", inventory: "$XX" },
    ],
  };

  // const handleDownloadPDF = () => {
    // const doc = new jsPDF();
    // doc.text("Order Details", 10, 10);
    // doc.text(`Date: ${orderDetails.date}`, 10, 20);
    // doc.text(`Time: ${orderDetails.time}`, 10, 30);
    // doc.text(`Ordered by: ${orderDetails.orderedBy}`, 10, 40);
    // doc.text(`Shift Number: ${orderDetails.shiftNumber}`, 10, 50);

    // let startY = 60;
    // orderDetails.items.forEach((item, index) => {
    //   doc.text(
    //     `${index + 1}. ${item.name} - BOH: ${item.boh}, Cash Order: ${item.cashOrder}, Inventory: ${item.inventory}`,
    //     10,
    //     startY
    //   );
    //   startY += 10;
    // });

    // doc.save("order-details.pdf");
  // };

  return (
    <div className="flex flex-col items-center w-screen p-6">
      <div className="text-center mb-6">
        <p>
          <span className="font-semibold">Date :</span> {orderDetails.date}{" "}
          <span className="font-semibold">Time :</span> {orderDetails.time}
        </p>
        <p>
          <span className="font-semibold">Ordered by :</span>{" "}
          {orderDetails.orderedBy}{" "}
          <span className="font-semibold">Shift Number :</span>{" "}
          {orderDetails.shiftNumber}
        </p>
      </div>

      <div className="w-full  border rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold text-center mb-4">Order List</h2>
        <div className="grid grid-cols-3 gap-4 text-center font-semibold mb-2">
          <p>BOH</p>
          <p>Cash Order</p>
          <p>Inventory</p>
        </div>
        {orderDetails.items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-3 gap-4 text-center items-center mb-2"
          >
            <p>{item.name}</p>
            <input
              type="text"
              value={item.boh}
              readOnly
              className="border rounded-lg px-2 py-1"
            />
            <input
              type="text"
              value={item.cashOrder}
              readOnly
              className="border rounded-lg px-2 py-1"
            />
            <input
              type="text"
              value={item.inventory}
              readOnly
              className="border rounded-lg px-2 py-1"
            />
          </div>
        ))}
      </div>

      <button
        // onClick={handleDownloadPDF}
        className="bg-red-500 text-white px-6 py-3 mt-6 rounded-lg font-medium hover:bg-red-600 transition"
      >
        Download as PDF
      </button>
    </div>
  );
};


