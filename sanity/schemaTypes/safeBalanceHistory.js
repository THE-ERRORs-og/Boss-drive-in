import { defineField, defineType } from "sanity";

export const safe_balance_history = defineType({
  name: "safe_balance_history",
  title: "Safe Balance History",
  type: "document",
  fields: [
    defineField({
      name: "depositAmount",
      title: "Deposit Amount",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "submittedBy",
      title: "Submitted By",
      type: "reference",
      to: [{ type: "user" }],
    }),
  ],
  preview: {
    select: {
      datetime: "_updatedAt",
      depositAmount: "depositAmount",
    },
    prepare({ datetime, depositAmount }) {
      // Format the datetime to display only the date
      const date = new Date(datetime).toLocaleDateString();
      return {
        title: date, // Display the formatted date
        subtitle: `$ ${depositAmount}`,
      };
    },
  },
});