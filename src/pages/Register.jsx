import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast"; // <-- For notifications

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Toggle between light and dark theme
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // Basic email format validation
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Handle email input change and validate
  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setEmailError("");
    if (emailValue && !validateEmail(emailValue)) {
      setEmailError("Please enter a valid email address");
    }
  };

  // Handle signup form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    setEmailError("");

    // Validate email
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Validate password
    if (!password) {
      toast.error("Password is required");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // Sign up user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Handle already registered email or other errors
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Account created! Please check your email to verify.");
      setTimeout(() => navigate("/login"), 3000); // Redirect after signup
    }
  };

  return (
    <div
      className={`w-full h-screen flex items-center justify-center transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <Toaster position="top-right" reverseOrder={false} />{" "}
      {/* Notification container */}
      {/* Theme toggle button */}
      <div
        className="absolute top-5 right-5 text-2xl cursor-pointer"
        onClick={toggleTheme}
      >
        {theme === "dark" ? <MdDarkMode /> : <MdLightMode />}
      </div>
      {/* Signup form container */}
      <div
        className={`mx-auto w-full md:w-[500px] h-[500px] p-10 border rounded transition-colors duration-300 ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800"
            : "border-gray-400 bg-white"
        }`}
      >
        <h1 className="font-bold text-4xl my-10">Sign Up</h1>
        <form onSubmit={handleSignup} className="flex flex-col gap-y-5 h-full">
          {/* Email input */}
          <div>
            <label>Email</label>
            <input
              className={`w-full border py-2 px-5 rounded transition-colors duration-300 ${
                emailError
                  ? "border-red-500"
                  : theme === "dark"
                  ? "border-gray-600"
                  : "border-gray-400"
              } ${
                theme === "dark"
                  ? "bg-gray-700 text-white placeholder-gray-300"
                  : "bg-white text-black placeholder-gray-500"
              }`}
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter email"
              required
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          {/* Password input */}
          <div>
            <label>Password</label>
            <input
              className={`w-full border py-2 px-5 rounded transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-300"
                  : "bg-white border-gray-400 text-black placeholder-gray-500"
              }`}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full font-medium py-2 border rounded hover:bg-gray-200 transition"
          >
            Sign Up
          </button>

          {/* Link to login page */}
          <span>
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 underline">
              Login here!
            </a>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Register;
