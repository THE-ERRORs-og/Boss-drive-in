"use client";
import { auth, signIn, signOut } from "@/auth";
import { doCredentialLogin } from "@/lib/actions/authentication";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const formData = new FormData(event.target); // Create a new FormData object
    try {
      const formValues = {
        email: formData.get("email"),
        password: formData.get("password"),
      }
      const response = await doCredentialLogin(formValues);

      if (response.success) {
        console.log("User logged in successfully");
        router.push("/admin");
      }
      else {
        console.error("Error:", response.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h1>Route: /Login</h1>
      <form onSubmit={handleFormSubmit}>
        {" "}
        {/* Use `onSubmit` instead of `action` */}
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" required />
        </label>
        <button type="submit">Sign In</button>{" "}
        {/* Explicitly set `type="submit"` */}
      </form>
    </div>
  );
}
