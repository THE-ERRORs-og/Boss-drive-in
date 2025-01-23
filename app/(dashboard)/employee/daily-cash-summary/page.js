export default function Page() {
  return (
    <div>
      {/* <h1>Route: /employee/daily-cash-summary</h1> */}
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Content */}
        <div className="flex flex-col px-8 py-6">
          {/* Staff Details */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-lg font-medium text-red-500">
              Staff Name: <span className="text-black">XXXXXXXXXX</span>
            </p>
            <div className="flex space-x-8">
              <p className="text-lg font-medium">
                Date: <span className="text-gray-600">DD/MM/YYYY</span>
              </p>
              <p className="text-lg font-medium">
                Shift Time: <span className="text-gray-600">XX:YY PM</span>
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <form className="space-y-6">
            {/* Cashout Fields */}
            <div className="grid gap-4">
              <div className="flex">
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Expected Closeout Cash
                </h1>
                <input
                  type="text"
                  placeholder="$---"
                  className="mt-1 w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex">
                <h1 className="text-lg font-medium text-gray-700 place-content-center m-4">
                  Starting Register Cash
                </h1>
                <input
                  type="text"
                  placeholder="$---"
                  className="mt-1 w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Online Tips */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-lg font-semibold">Online Tips</p>
                <p className="text-sm">Toast</p>
                <input
                  type="text"
                  placeholder="$---"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <p className="text-lg font-semibold">Amount</p>
                <p className="text-sm">Kiosk</p>
                <input
                  type="text"
                  placeholder="$---"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <hr className="my-4 border-gray-300" />

            {/* Totals */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Tip Deduction
                </label>
                <input
                  type="text"
                  placeholder="$XX"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Owned To Restaurant Safe
                </label>
                <input
                  type="text"
                  placeholder="$XX"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className=" justify-items-center w-[50vw] bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition duration-300"
            >
              Submit & Download PDF
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
