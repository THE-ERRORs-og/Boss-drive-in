"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUser, updateUserRole } from "@/lib/actions/user";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/context/SessionContext";
import { rolesPriority } from "@/lib/constants";

export default function UserItem({ user, idx, onRemove }) {
  const currentUser = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const currUserRole = rolesPriority[currentUser?.user?.role] || 0;
  const [userRole,setUserRole] = useState(rolesPriority[user.role] || 0);

  const handleRemoveUser = async () => {
    try {
      const result = await deleteUser(user._id);
      if (result.status === "SUCCESS") {
        toast({
          variant: "success",
          title: "Success",
          description: `User ${user.name} removed successfully`,
        });
        setIsPopupVisible(false);
        onRemove(user._id);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove user",
      });
    }
  };

  const handleRoleChange = async () => {
    try {
      const newRole = userRole === 0 ? 'admin' : 'employee';
      const result = await updateUserRole(user._id, newRole);
      if (result.status === "SUCCESS") {
        setUserRole(rolesPriority[newRole]);
        toast({
          variant: "success",
          title: "Success",
          description: `User role updated to ${newRole}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update user role",
      });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <div className="flex w-full items-center content-center p-1">
      <div className="rounded-lg border-2 w-[74vw] p-2">
        <p className="text-lg font-medium">
          {idx + 1}. {user.name}
        </p>
      </div>
      <button
        onClick={() =>
          router.push(`/admin/staff-management/employee/${user.userid}`)
        }
        disabled={currUserRole <= userRole ? true : false}
        className={`m-1 px-6 py-2 bg-[#ED1C24] text-sm md:text-md text-white rounded-lg font-medium hover:bg-red-600 transition duration-300 ${
          currUserRole <= userRole ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        Profile
      </button>
      <button
        onClick={handleFormSubmit}
        disabled={currUserRole <= userRole ? true : false}
        className={`m-1 px-6 py-2 bg-[#ED1C24] text-sm md:text-md text-white rounded-lg font-medium hover:bg-red-600 transition duration-300 ${
          currUserRole <= userRole ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        Remove
      </button>

      {currUserRole >= 2 && (
        <button
          onClick={handleRoleChange}
          disabled={currUserRole <= userRole ? true : false}
          className={`m-1 px-6 py-2 min-w-40 bg-[#ED1C24] text-sm md:text-md text-white rounded-lg font-medium hover:bg-red-600 transition duration-300 ${
            currUserRole <= userRole ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          {userRole === 0 ? "Make Admin" : "Make Employee"}
        </button>
      )}

      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-xl font-medium mb-4">
              Are you sure you want to remove this member?
            </p>
            <div>
              <button
                onClick={handleRemoveUser}
                className="m-4 px-6 py-2 bg-[#ED1C24] text-sm md:text-lg text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
              >
                Remove Member
              </button>
              <button
                onClick={closePopup}
                className="m-4 px-6 py-2 border-2 text-sm md:text-lg text-black rounded-lg font-medium transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
