import { timeOptions } from "@/lib/constants";
import { getCashSummaryById } from "@/lib/actions/cashSummary";

export default async function Page({ params }) {
  const { id } = await params;

  // Fetch data for the cash summary using the id
  const result = await getCashSummaryById(id);
  
  if (result.status === "ERROR") {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-lg">{result.error}</p>
      </div>
    );
  }

  const cashSummary = result.data;

  return (
    <div>
      <div className="h-screen bg-gray-50 flex flex-col">
        <div className="flex flex-col px-8 py-2">
          <div className="w-full flex justify-between items-center m-4">
            <p className="text-base font-semibold text-red-500">
              Staff Name:{" "}
              <span className="text-black">{cashSummary?.createdBy?.name}</span>
            </p>
            <div className="flex space-x-4 items-center">
              <div className="flex items-center">
                <p className="text-base font-semibold mr-2">Date:</p>
                <p className="text-sm">{new Date(cashSummary?.datetime).toLocaleDateString() || "N/A"}</p>
              </div>
              <div className="flex items-center">
                <p className="text-base font-semibold mr-2">Shift Time:</p>
                <p className="text-sm">
                  {timeOptions[cashSummary?.shiftNumber - 1] || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2">
              <div className="">
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Expected Closeout Cash
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Starting Register Cash
                </h1>
              </div>
              <div className="gap-2 items-center flex flex-col place-content-center">
                <p className="mt-1 w-full px-4 py-1 text-sm border border-gray-300 rounded-lg shadow-sm">
                  ${(cashSummary?.expectedCloseoutCash || 0).toFixed(2)}
                </p>
                <p className="mt-1 w-full px-4 py-1 text-sm border border-gray-300 rounded-lg shadow-sm">
                  ${(cashSummary?.startingRegisterCash || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 ml-4">
              <div>
                <p className="text-lg font-bold">Online Tips</p>
              </div>
              <div>
                <p className="text-lg font-bold">Amount</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Toast
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Kiosk
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Cash
                </h1>
              </div>
              <div className="gap-2 items-center flex flex-col place-content-center">
                <p className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm">
                  ${(cashSummary?.onlineTipsToast || 0).toFixed(2)}
                </p>
                <p className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm">
                  ${(cashSummary?.onlineTipsKiosk || 0).toFixed(2)}
                </p>
                <p className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm">
                  ${(cashSummary?.onlineTipCash || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <hr className="my-4 border-gray-300 font-extrabold" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Total Tip Deduction
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  OWED To Restaurant Safe
                  <span className="text-sm text-gray-500 block font-normal">
                    (Negative value means reduction from bank safe)
                  </span>
                </h1>
              </div>
              <div className="gap-2 items-center flex flex-col place-content-center">
                <p className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm">
                  ${(cashSummary?.totalTipDeduction || 0).toFixed(2)}
                </p>
                <p
                  className={`mt-1 w-full px-4 py-2 text-sm border rounded-lg shadow-sm ${
                    cashSummary?.ownedToRestaurantSafe < 0
                      ? "border-yellow-400 bg-yellow-50 text-red-600"
                      : "border-gray-300"
                  }`}
                >
                  ${(cashSummary?.ownedToRestaurantSafe || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <hr className="my-4 border-gray-300 font-extrabold" />

            <div className="grid grid-cols-2 gap-4 ml-4">
              <div>
                <p className="text-lg font-bold">Other Closing Info</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Cash Tips
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Removal Amount
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Removal Item Count
                </h1>
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Discounts
                </h1>
              </div>
              <div className="gap-2 items-center flex flex-col place-content-center">
                <p className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm">
                  ${(cashSummary?.onlineTipCash || 0).toFixed(2)}
                </p>
                <p className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm">
                  ${(cashSummary?.removalAmount || 0).toFixed(2)}
                </p>
                <p className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm">
                  {cashSummary?.removalItemCount || 0}
                </p>
                <p className="mt-1 w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm">
                  ${(cashSummary?.discounts || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
