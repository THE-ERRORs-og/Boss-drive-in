"use client";

import { useState, useEffect } from "react";
import UserItem from "./UserItem";
import { getAllUsers } from "@/lib/actions/user";
import { useToast } from "@/hooks/use-toast";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
 
  // Fetch users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await getAllUsers();
        if (result.status === "SUCCESS") {
          setUsers(result.data);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "Failed to fetch users"
          });
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch users"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRemoveUserFromList = (id) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
  };

  if (loading) {
    return (
      <div className="h-[95vh] m-5 pl-8 pr-8 flex flex-col">
        <h1 className="font-semibold text-3xl p-1">
          Remove the member you want to remove:
        </h1>
        <div className="h-[80vh] mb-4 w-full rounded-md border shadow-inner-lg overflow-y-auto flex items-center justify-center">
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="h-[95vh] m-5 pl-8 pr-8 flex flex-col">
        <h1 className="font-semibold text-3xl p-1">
          Remove the member you want to remove:
        </h1>
        <div className="h-[80vh] mb-4 w-full rounded-md border shadow-inner-lg overflow-y-auto flex items-center justify-center">
          <p className="text-gray-500">No users found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[95vh] m-5 pl-8 pr-8 flex flex-col">
      <h1 className="font-semibold text-3xl p-1">
        Remove the member you want to remove:
      </h1>
      <div className="h-[80vh]  overflow-y-scroll mb-4 w-full rounded-md border shadow-inner-lg ">
        {/* Table Body */}
        <div>
          {users.map((user, idx) => (
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
