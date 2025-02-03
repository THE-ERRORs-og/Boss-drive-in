"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUser } from "@/lib/actions/registerUser";
import { useToast } from "@/hooks/use-toast";

export default function UserItem({ user,idx,  onRemove }) {
  const router = useRouter();
  const {toast} = useToast();
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleRemoveUser = async () => {
    try {
      const result = await deleteUser(user._id);
      if (result.status === "SUCCESS"){
        console.log(`User ${user.name} removed successfully`);
        setIsPopupVisible(false);
        toast({
          variant: "success",
          title: "Success",
          description: `User ${user.name} removed successfully`,
        });
        onRemove(user._id); // Call the parent's remove function to update the list
      }
      else {
        console.error("Error removing user:", result.error);
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      }
    } catch (error) {
      console.error("Error removing user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
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
          {idx+1}. {user.name}
        </p>
      </div>
      <button
        onClick={() =>
          router.push(`/admin/staff-management/employee/${user.userid}`)
        }
        className="m-1 px-6 py-2 bg-[#ED1C24] text-sm md:text-md text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
      >
        Profile
      </button>
      <button
        onClick={handleFormSubmit}
        className="m-1 px-6 py-2 bg-[#ED1C24]  text-sm md:text-md text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
      >
        Remove
      </button>

      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-xl font-medium mb-4">
              Are you sure you want to remove this member?
            </p>
            <div>
              <button
                onClick={handleRemoveUser}
                className="m-4 px-6 py-2 bg-[#ED1C24]  text-sm md:text-lg text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
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
