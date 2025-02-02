"use client";
import { auth, signIn, signOut } from "@/auth";
import { doCredentialLogin } from "@/lib/actions/authentication";
import { useRoute } from "next/navigation";
import Image from "next/image";
import arrow_back from "../../../public/arrow_back.svg";
import staff_illu from "../../../public/staff_illu.svg";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    setIsLoading(true); // Set the loading state to true
    const formData = new FormData(event.target); // Create a new FormData object
    try {
      const formValues = {
        userid: formData.get("userid"),
        password: formData.get("password"),
      };
      const response = await doCredentialLogin(formValues);

      if (response.success) {
        console.log("User logged in successfully");
        toast({
          variant: "success",
          title: "Login Successful",
        })
        router.push("/admin");
      } else {
        console.error("Error:", response.error);
        toast({
          variant: "error",
          title: "Login Failed",
          description: response.error,
        })
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "error",
        title: "Login Failed",
        description: error.message,
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Content */}
      <div className="flex flex-1 items-center justify-between px-10">
        {/* Left Section */}
        <div className="flex flex-col w-1/2">
          {/* Back Button */}
          <button className="mb-6 text-xl text-gray-700 flex items-center">
            <Image
              className="material-icons mr-2"
              src={arrow_back}
              alt="back"
            />
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
            <button
              type="submit"
              className={`w-full text-white py-2 rounded-lg  transition duration-300"
              ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
            >
              Login
            </button>
          </form>
        </div>

        {/* Right Section */}
        <div className="w-1/2 flex justify-center">
          <Image src={staff_illu} alt="Staff Illustration" className="w-4/5" />
        </div>
      </div>
    </div>
  );
}
