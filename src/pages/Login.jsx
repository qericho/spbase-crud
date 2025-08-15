import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // Handle user login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Login successful!");
      navigate("/crud"); // redirect to CRUD dashboard
    }
  };

  // Demo login handler
  const handleDemoLogin = () => {
    setEmail("demo@gmail.com");
    setPassword("12345@23");
    toast("Demo credentials filled!", {
      icon: "⚡",
    });
  };

  return (
    <div
      className={`w-full h-screen flex items-center justify-center transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      {/* Toaster notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Theme toggle button */}
      <div
        className="absolute top-5 right-5 text-2xl cursor-pointer"
        onClick={toggleTheme}
      >
        {theme === "dark" ? <MdDarkMode /> : <MdLightMode />}
      </div>

      {/* Login form container */}
      <div
        className={`mx-auto w-full md:w-[500px] h-[500px] p-10 border rounded transition-colors duration-300 ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800"
            : "border-gray-400 bg-white"
        }`}
      >
        <h1 className="font-bold text-4xl my-10">Login</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-y-5 h-full">
          {/* Email input */}
          <div>
            <label>Email</label>
            <input
              className={`w-full border py-2 px-5 rounded transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-300"
                  : "bg-white border-gray-400 text-black placeholder-gray-500"
              }`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
            />
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

          {/* Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full font-medium py-2 border rounded hover:bg-yellow-200 transition mb-2"
          >
            Demo Login
          </button>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full font-medium py-2 border rounded hover:bg-gray-200 transition"
          >
            Login
          </button>

          {/* Link to registration */}
          <span>
            Don't have an account?{" "}
            <a href="/register" className="text-blue-500 underline">
              Register here!
            </a>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
