"use client";
import { doCredentialLogin } from "@/lib/actions/authentication";
import { useRouter } from "next/navigation";
import Image from "next/image";
import arrow_back from "@/public/arrow_back.svg";
import MainButton from "../Button/MainButton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { z } from "zod";

export default function EmployeeLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const router = useRouter();
  const handleFormSubmit = async (event) => {
    event.preventDefault(); 
    setIsLoading(true);
    const formData = new FormData(event.target);
    try {
      const formValues = {
        userid: formData.get("userid"),
        password: formData.get("password"),
      };
        if (formValues.userid.trim() === "") {
          toast({
            variant: "destructive",
            title: "Employee ID is required",
            description: "Login Failed",
          });
          setIsLoading(false);
          return;
        }
        if (formValues.password.trim().length < 5) {
          toast({
            variant: "destructive",
            title: "Password must be at least 5 characters long",
            description: "Login Failed",
          });
          setIsLoading(false);
          return;
        }
      const response = await doCredentialLogin(formValues);

      if (response.status === "SUCCESS") {
        console.log("User logged in successfully");
        toast({
          variant: "success",
          title: "Login Successful",
        });
        router.push("/employee");
      } else {
        console.log(response.error);
        if (response.error.toString().includes("Invalid password")) {
          toast({
            variant: "destructive",
            title: "Wrong Password",
            description: "Login Failed",
          });
        }
        else if (response.error.toString().includes("No user found")) {
          toast({
            variant: "destructive",
            title: "No user found",
            description: "Login Failed",
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "error",
        title: "Login Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-1/2">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-6 text-xl text-gray-700 flex items-center"
      >
        <Image className="material-icons mr-2" src={arrow_back} alt="back" />
      </button>

      {/* Heading */}
      <h1 className="text-3xl font-semibold text-red-500 mb-8">
        Logging in as staff
      </h1>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleFormSubmit}>
        {/* Employee ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Enter employee ID <span className="text-red-500">*</span>
          </label>
          <input
            name="userid"
            type="text"
            placeholder="Example: 12345678"
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Enter your password <span className="text-red-500">*</span>
          </label>
          <input
            name="password"
            type="password"
            placeholder="Example: 12345678"
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Login Button */}
        <MainButton
          type="submit"
          text="Login"
          isLoading={isLoading}
          className={`w-full text-white py-2 rounded-lg transition duration-30`}
        />
      </form>
    </div>
  );
}
