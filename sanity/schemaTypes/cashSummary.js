import { defineField, defineType } from "sanity";

export const cash_summary = defineType({
  name: "cash_summary",
  title: "Cash Summary",
  type: "document",
  fields: [
    defineField({
      name: "expectedCloseoutCash",
      title: "Expected Closeout Cash",
      type: "number",
      validation: (Rule) => Rule.required().min(0).precision(2),
    }),
    defineField({
      name: "startingRegisterCash",
      title: "Starting Register Cash",
      type: "number",
      validation: (Rule) => Rule.required().min(0).precision(2),
    }),
    defineField({
      name: "onlineTipsToast",
      title: "Online Tips (Toast)",
      type: "number",
      validation: (Rule) => Rule.min(0).precision(2),
    }),
    defineField({
      name: "onlineTipsKiosk",
      title: "Online Tips (Kiosk)",
      type: "number",
      validation: (Rule) => Rule.min(0).precision(2),
    }),
    defineField({
      name: "onlineTipCash",
      title: "Online Tip (Cash)",
      type: "number",
      validation: (Rule) => Rule.min(0).precision(2),
    }),
    defineField({
      name: "totalTipDeduction",
      title: "Total Tip Deduction",
      type: "number",
      validation: (Rule) => Rule.min(0).precision(2),
    }),
    defineField({
      name: "ownedToRestaurantSafe",
      title: "Owned to Restaurant Safe",
      type: "number",
      validation: (Rule) => Rule.precision(2),
    }),
    defineField({
      name: "datetime",
      title: "Date and Time",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "createdBy",
      title: "Created By",
      type: "reference",
      to: [{ type: "user" }],
    }),
    defineField({
      name: "shiftNumber",
      title: "Shift Number",
      type: "number",
      options: {
        list: [
          { title: "1", value: 1 },
          { title: "2", value: 2 },
          { title: "3", value: 3 },
          { title: "4", value: 4 },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      datetime: "datetime",
      shiftNumber: "shiftNumber",
    },
    prepare({ datetime, shiftNumber }) {
      // Format the datetime to display only the date
      const date = new Date(datetime).toLocaleDateString();
      return {
        title: date, // Display the formatted date
        subtitle: `Shift Number: ${shiftNumber}`,
      };
    },
  },
});
