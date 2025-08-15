import { useTheme } from "./context/ThemeContext";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  MdDarkMode,
  MdLightMode,
  MdOutlineDeleteOutline,
  MdOutlineEdit,
} from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Crud = () => {
  const { theme, setTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ task: "", desc: "" });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTask, setEditTask] = useState({ task: "", desc: "" });
  const [errors, setErrors] = useState({ add: {}, edit: {} });
  const [session, setSession] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSession(session);
    if (!session) return;

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", session.user.id);

    if (!error) setTasks(data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add new task
  const handleAdd = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!newTask.task.trim()) newErrors.task = true;
    if (!newTask.desc.trim()) newErrors.desc = true;
    if (Object.keys(newErrors).length) {
      setErrors((prev) => ({ ...prev, add: newErrors }));
      return;
    }
    setErrors((prev) => ({ ...prev, add: {} }));

    const { data: insertedTask, error } = await supabase
      .from("tasks")
      .insert([{ ...newTask, user_id: session.user.id }])
      .select()
      .single();

    if (error) {
      toast.error("Failed to add task");
      return;
    }

    setTasks((prev) => [...prev, insertedTask]);
    setNewTask({ task: "", desc: "" });
    toast.success("Task added!");
  };

  // Delete task
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      toast.error("Failed to delete task");
      return;
    }

    setTasks((prev) => prev.filter((task) => task.id !== id));
    toast.success("Task deleted!");
  };

  // Start editing a task
  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditTask({ task: task.task, desc: task.desc });
    setErrors((prev) => ({ ...prev, edit: {} }));
  };

  // Save edited task
  const handleEditSave = async () => {
    const newErrors = {};
    if (!editTask.task.trim()) newErrors.task = true;
    if (!editTask.desc.trim()) newErrors.desc = true;
    if (Object.keys(newErrors).length) {
      setErrors((prev) => ({ ...prev, edit: newErrors }));
      return;
    }
    setErrors((prev) => ({ ...prev, edit: {} }));

    const { data: updatedTask, error } = await supabase
      .from("tasks")
      .update({ task: editTask.task, desc: editTask.desc })
      .eq("id", editingTaskId)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (error) {
      toast.error("Failed to update task");
      return;
    }

    setTasks((prev) =>
      prev.map((task) => (task.id === editingTaskId ? updatedTask : task))
    );
    setEditingTaskId(null);
    setEditTask({ task: "", desc: "" });
    toast.success("Task updated!");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditTask({ task: "", desc: "" });
    setErrors((prev) => ({ ...prev, edit: {} }));
  };

  // Toggle theme between light and dark
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // Logout user
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error logging out: " + error.message);
      return;
    }
    toast.success("Logged out successfully!");
    setTimeout(() => navigate("/login"), 1000);
  };

  return (
    <div
      className={`w-full mx-auto p-5 min-h-screen transition-colors duration-300 ${
        theme === "dark" ? "text-white bg-gray-900" : "bg-white text-black"
      }`}
    >
      {/* Toaster notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 8000,
          style: { borderRadius: "8px", padding: "8px 16px", fontSize: "14px" },
          success: { duration: 8000, pauseOnHover: false },
          error: { duration: 8000, pauseOnHover: false },
        }}
      />

      {/* Top Bar with theme toggle and profile */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SIMPLE CRUD</h1>
        <div className="flex items-center gap-4 relative">
          <span
            onClick={toggleTheme}
            className="text-2xl cursor-pointer hover:scale-110"
          >
            {theme === "dark" ? <MdDarkMode /> : <MdLightMode />}
          </span>
          <div className="relative">
            <FaUserCircle
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="text-3xl cursor-pointer hover:scale-110"
            />
            {dropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-500/20"
                  onClick={() => alert("Profile Settings Clicked")}
                >
                  Profile Settings
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-500/20"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      <form
        onSubmit={handleAdd}
        className={`w-full md:w-[400px] border rounded-lg p-5 mb-8 shadow-md transition-colors duration-300 ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800"
            : "border-gray-400 bg-white"
        }`}
      >
        {/* Task input */}
        <input
          value={newTask.task}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, task: e.target.value }))
          }
          className={`border rounded px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 transition-colors duration-300 ${
            errors.add.task
              ? "border-red-500 focus:ring-red-400"
              : theme === "dark"
              ? "border-gray-600 focus:ring-blue-400 bg-gray-700 text-white"
              : "border-gray-400 focus:ring-blue-400 bg-white text-black"
          }`}
          type="text"
          placeholder="Task"
        />

        {/* Description input */}
        <textarea
          value={newTask.desc}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, desc: e.target.value }))
          }
          className={`border rounded px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 transition-colors duration-300 ${
            errors.add.desc
              ? "border-red-500 focus:ring-red-400"
              : theme === "dark"
              ? "border-gray-600 focus:ring-blue-400 bg-gray-700 text-white"
              : "border-gray-400 focus:ring-blue-400 bg-white text-black"
          }`}
          placeholder="Description"
          rows={3}
        />
        <button
          type="submit"
          className="cursor-pointer text-sm font-semibold bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 transition"
        >
          Save
        </button>
      </form>

      {/* Task List */}
      <div className="w-full h-full">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {tasks.filter(Boolean).map((task) => (
            <li
              key={task.id}
              className={`flex flex-col justify-between border rounded p-3 shadow-sm w-full transition-colors duration-300 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-400 bg-white"
              }`}
            >
              {/* Edit mode */}
              {editingTaskId === task.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={editTask.task}
                    onChange={(e) =>
                      setEditTask((prev) => ({ ...prev, task: e.target.value }))
                    }
                    className={`border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 transition-colors duration-300 ${
                      errors.edit.task
                        ? "border-red-500 focus:ring-red-400"
                        : theme === "dark"
                        ? "border-gray-600 focus:ring-blue-400 bg-gray-700 text-white"
                        : "border-gray-400 focus:ring-blue-400 bg-white text-black"
                    }`}
                  />
                  <textarea
                    value={editTask.desc}
                    onChange={(e) =>
                      setEditTask((prev) => ({ ...prev, desc: e.target.value }))
                    }
                    className={`border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 transition-colors duration-300 ${
                      errors.edit.desc
                        ? "border-red-500 focus:ring-red-400"
                        : theme === "dark"
                        ? "border-gray-600 focus:ring-blue-400 bg-gray-700 text-white"
                        : "border-gray-400 focus:ring-blue-400 bg-white text-black"
                    }`}
                    rows={3}
                  />
                </div>
              ) : (
                // Display mode
                <div className="flex flex-col w-full h-[150px] overflow-auto px-2">
                  <p className="font-semibold">{task.task}</p>
                  <p className="text-gray-400 whitespace-pre-wrap break-words">
                    {task.desc}
                  </p>
                </div>
              )}

              {/* Task actions */}
              <div className="flex gap-2 mt-2">
                {editingTaskId === task.id ? (
                  <>
                    <button
                      onClick={handleEditSave}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <div className="flex">
                    <button
                      onClick={() => startEdit(task)}
                      className="text-gray px-1 py-1 text-xl hover:text-blue-500 cursor-pointer"
                    >
                      <MdOutlineEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-gray px-1 py-1 text-xl hover:text-red-500 cursor-pointer"
                    >
                      <MdOutlineDeleteOutline />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Crud;
