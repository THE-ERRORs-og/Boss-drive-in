import { defineField, defineType } from "sanity";

export const constant = defineType({
  name: "constant",
  title: "Constant",
  type: "document",
  fields: [
    defineField({
      name: "lastUpdated",
      title: "Last Updated",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lastUpdated_by",
      title: "Last Updated By",
      type: "reference",
      to: [{ type: "user" }],
    }),
    defineField({
      name: "value",
      title: "Value",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      Subtitles: "value",
    },
  },
});
