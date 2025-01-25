"use client";

import { useState } from "react";
import { z } from "zod";
import { userSchema } from "@/lib/validation"; // use this for schema
import { useToast } from "@/hooks/use-toast";
import { createUser } from "@/lib/actions/registerUser";

export default function Page() {
    const { toast } = useToast();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [formData, setFormData] = useState({
    role:"employee",
    name: "",
    userid: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = async (data) => {
    try {
      // console.log('validating form', data);
      await userSchema.parseAsync(data);
      if (data.password !== data.confirmPassword) {
        setErrors({ confirmPassword: "Passwords do not match" });
        return false;
      }
      setErrors({});
      return true;
    } catch (error) {
      // console.log(error);
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {});
        toast({
          variant: "destructive",
          title: `Error in ${error.errors[0].path[0]}`,
          description: `${error.errors[0].message}`,
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (await validateForm(formData)) {
      setIsPopupVisible(true);
    }
  };

  const submitPopupForm = async () => {
    try {
      const response =await  createUser(formData);
      if(response.status === "SUCCESS"){
        toast({
          variant: "success",
          title: "User added successfully",
          description: "User has been added successfully",  
        });
        setFormData({
          role: "employee",
          name: "",
          userid: "",
          password: "",
          confirmPassword: "",
        });
      }else{
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error,
        });
      }
    } catch (error) {
      console.error("Error adding user", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while adding user",
      });
      
    } finally {
      setIsPopupVisible(false);
    }

  };

  const closePopup = () => {
    setIsPopupVisible(false); // Hide the popup
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 w-full">
        {/* Form */}
        <h1 className="text-lg font-semibold mb-4">
          Enter the details of employee you want to add:
        </h1>
        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-2">
            <div className="items-center">
              <h1 className="text-lg font-medium place-content-center m-4">
                Enter name of new member
              </h1>
              <h1 className="text-lg font-medium place-content-center m-4">
                Enter user id of new member
              </h1>
              <h1 className="text-lg font-medium place-content-center m-4">
                Create password for new member
              </h1>
              <h1 className="text-lg font-medium place-content-center m-4">
                Confirm password for new member
              </h1>
            </div>
            <div className="mb-10 gap-2 items-center flex flex-col place-content-center">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Albert Anthony"
                className={`mt-1 w-full px-3 py-2 border ${errors.name ? "border-red-600" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              <input
                type="text"
                name="userid"
                value={formData.userid}
                onChange={handleInputChange}
                placeholder="albert.anthony"
                className={`mt-1 w-full px-3 py-2 border ${errors.userid ? "border-red-600" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="******"
                className={`mt-1 w-full px-3 py-2 border ${errors.password ? "border-red-600" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="******"
                className={`mt-1 w-full px-3 py-2 border ${errors.confirmPassword ? "border-red-600" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-[20vw] bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
            >
              Add member
            </button>
          </div>
        </form>
        {isPopupVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="text-lg font-medium">
                Are you sure to add the member
              </p>
              <div className="">
                <button
                  onClick={submitPopupForm} // submit the form after clicking this
                  className="m-4 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition duration-300"
                >
                  Add Member
                </button>
                <button
                  onClick={closePopup}
                  className="m-4 px-6 py-2 border-2 rounded-lg font-medium transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
