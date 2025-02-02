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
    <div className="h-[95vh] m-5 pl-8 pr-8 flex flex-col  ">
      <h1 className="font-semibold text-3xl p-1">
        Remove the member you want to remove:
      </h1>
      <div className="h-[80vh] mb-4 w-full rounded-md border shadow-inner-lg overflow-y-auto">

      {/* Table Body */}
      <div>
      {users.map((user,idx) => (
        <UserItem
          key={user._id}
          idx={idx}
          user={user}
          onRemove={handleRemoveUserFromList}
        />
      ))}
      </div>
    </div>

      
    </div>
  );
}
