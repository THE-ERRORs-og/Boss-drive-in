import { defineField, defineType } from "sanity";

export const order_summary = defineType({
  name: "order_summary",
  title: "Order Summary",
  type: "document",
  fields: [
    defineField({
      name: "createdBy",
      title: "Created By",
      type: "reference",
      to: [{ type: "user" }],
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      options: {
        dateFormat: "DD/MM/YYYY",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "shiftTime",
      title: "Shift Time",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "submissionDate",
      title: "Submission Date",
      type: "datetime",
      options: {
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm",
        calendarTodayLabel: "Today",
      },
      initialValue: () => new Date().toISOString(), // Automatically sets the current datetime
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "itemName",
              title: "Item Name",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "boh",
              title: "BOH",
              type: "number",
              validation: (Rule) => Rule.min(0).precision(2),
            }),
            defineField({
              name: "cashOrder",
              title: "Cash Order",
              type: "number",
              validation: (Rule) => Rule.min(0).precision(2),
            }),
            defineField({
              name: "inventory",
              title: "Inventory",
              type: "number",
              validation: (Rule) => Rule.min(0).precision(2),
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      createdBy: "createdBy.name",
      date: "date",
      shiftTime: "shiftTime",
      submissionDate: "submissionDate",
    },
    prepare({ createdBy, date, shiftTime, submissionDate }) {
      const formattedDate = date ? date : "No date provided";
      const formattedShiftTime = shiftTime
        ? shiftTime
        : "No shift time provided";
      const formattedSubmissionDate = submissionDate
        ? new Date(submissionDate).toLocaleString()
        : "No submission date";
      const title = createdBy
        ? `Created by: ${createdBy}`
        : "Staff Name: Unknown";

      return {
        title,
        subtitle: `Date: ${formattedDate}, Shift Time: ${formattedShiftTime}, Submitted: ${formattedSubmissionDate}`,
      };
    },
  },
});
