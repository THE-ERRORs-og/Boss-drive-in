"use client";

import { useState } from "react";
import { client } from "@/sanity/lib/client";
import { ALL_USERS_QUERY } from "@/sanity/lib/queries";
import UserItem from "./UserItem";

export default function UserList() {
  const [users, setUsers] = useState([]);

  // Fetch users when the component mounts
  useState(() => {
    const fetchUsers = async () => {
      const data = await client
        .withConfig({ useCdn: false })
        .fetch(ALL_USERS_QUERY);
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleRemoveUserFromList = (id) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
  };

  return (
    <div className="m-5">
      <h1 className="font-semibold mb-4">
        Remove the member you want to remove:
      </h1>
      {users.map((user,idx) => (
        <UserItem
          key={user._id}
          idx={idx}
          user={user}
          onRemove={handleRemoveUserFromList}
        />
      ))}
    </div>
  );
}
