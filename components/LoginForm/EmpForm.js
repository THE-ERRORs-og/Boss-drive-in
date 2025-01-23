"use client";
import { doCredentialLogin } from "@/lib/actions/authentication";
import { useRouter } from "next/navigation";
import Image from "next/image";
import arrow_back from "@/public/arrow_back.svg";
import MainButton from "../Button/MainButton";

export default function EmployeeLoginForm() {
    const router = useRouter();
  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const formData = new FormData(event.target); // Create a new FormData object
    try {
      const formValues = {
        userid: formData.get("userid"),
        password: formData.get("password"),
      }
      const response = await doCredentialLogin(formValues);

      if (response.success) {
        console.log("User logged in successfully");
        router.push("/employee");
      }
      else {
        console.error("Error:", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
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
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-300"
        />
      </form>
    </div>
  );
}
