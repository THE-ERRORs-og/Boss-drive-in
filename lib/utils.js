import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function parseServerActionResponse(response) {
  return JSON.parse(JSON.stringify(response));
}

export function processCashSummaryData(rawData) {
  // Group data by date
  const groupedData = rawData.reduce((acc, item) => {
    // Extract date from datetime (YYYY-MM-DD)
    const date = item.datetime.split("T")[0];

    // Initialize the group for this date if not already done
    if (!acc[date]) {
      // console.log(item);
      acc[date] = {
        date,
        name: item.createdBy?.name && "Nan", // Default to the first record's creator
        shiftIds: [], // Array to hold shift numbers and IDs
        balance: 0, // Sum of ownedToRestaurantSafe
      };
    }

    // Update the group
    acc[date].shiftIds.push({ No: item.shiftNumber, id: item._id });
    acc[date].balance += item.ownedToRestaurantSafe;

    // Check if this record is the latest for the date
    // Assume data is sorted by datetime desc, shiftNumber desc
    if (new Date(item.datetime) > new Date(acc[date].datetime || 0)) {
      acc[date].name = item.createdBy.name;
      acc[date].datetime = item.datetime; // Update datetime for the latest check
    }

    return acc;
  }, {});
  // Convert grouped object into an array
  return Object.values(groupedData);
}