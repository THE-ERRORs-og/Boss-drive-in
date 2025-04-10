"use client";
import { doCredentialLogin } from "@/lib/actions/authentication";
import { useRouter } from "next/navigation";
import Image from "next/image";
import arrow_back from "@/public/arrow_back.svg";
import MainButton from "../Button/MainButton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function EmployeeLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setFormErrors({});

    const formData = new FormData(event.target);
    const userid = formData.get("userid")?.trim();
    const password = formData.get("password")?.trim();

    // Client-side validation
    const errors = {};
    if (!userid) errors.userid = "Employee ID is required";
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await doCredentialLogin({ userid, password });

      if (response.status === "SUCCESS") {
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        router.push("/employee");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || "Failed to login",
        });
        if (response.error?.toLowerCase().includes("credentials")) {
          setFormErrors({
            general: "Invalid employee ID or password",
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during login",
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
        {formErrors.general && (
          <div className="text-sm text-red-500">{formErrors.general}</div>
        )}

        {/* Employee ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Enter employee ID <span className="text-red-500">*</span>
          </label>
          <input
            name="userid"
            type="text"
            placeholder="Example: 12345678"
            className={`mt-1 w-full px-4 py-2 border ${
              formErrors.userid ? "border-red-500" : "border-gray-300"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
          />
          {formErrors.userid && (
            <div className="text-sm text-red-500 mt-1">{formErrors.userid}</div>
          )}
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
            className={`mt-1 w-full px-4 py-2 border ${
              formErrors.password ? "border-red-500" : "border-gray-300"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500`}
          />
          {formErrors.password && (
            <div className="text-sm text-red-500 mt-1">{formErrors.password}</div>
          )}
        </div>

        {/* Login Button */}
        <MainButton
          type="submit"
          text={isLoading ? "Logging in..." : "Login"}
          disabled={isLoading}
          className={`w-full text-white py-2 rounded-lg transition duration-300 ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          }`}
        />
      </form>
    </div>
  );
}
