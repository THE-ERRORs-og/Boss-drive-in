import { UserIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { client } from "../lib/client";

export const user = defineType({
  name: "user",
  title: "User",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) =>
        Rule.required()
          .email()
          .custom(async (email, context) => {
            const { document } = context;
            const existingUsers = await client.fetch(
              `*[_type == "user" && email == $email && _id != $id][0]`,
              { email, id: document._id }
            );

            if (existingUsers) {
              return "This email is already in use.";
            }
            return true;
          }),
    }),
    defineField({
      name: "password",
      title: "Password",
      type: "string",
      hidden: true, // Hide the password field in the UI
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      options: {
        list: [
          { title: "Admin", value: "admin" },
          { title: "Employee", value: "employee" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "createdBy",
      title: "Created By",
      type: "reference",
      to: [{ type: "user" }],
    }),
  ],
  preview: {
    select: {
      title: "name",
    },
  },
});
