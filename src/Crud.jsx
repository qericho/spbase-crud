import { useTheme } from "./context/ThemeContext";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  MdDarkMode,
  MdLightMode,
  MdOutlineDeleteOutline,
  MdOutlineEdit,
} from "react-icons/md";

const Crud = () => {
  const { theme, setTheme } = useTheme();

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ task: "", desc: "" });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTask, setEditTask] = useState({ task: "", desc: "" });
  const [errors, setErrors] = useState({ add: {}, edit: {} });

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*");
    if (error) console.error("Error fetching tasks:", error.message);
    else setTasks(data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add Task
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
      .insert([newTask])
      .select()
      .single();

    if (error) {
      console.error("Error adding task:", error.message);
      return;
    }

    setTasks((prev) => [...prev, insertedTask]);
    setNewTask({ task: "", desc: "" });
  };

  // Delete Task
  const handleDelete = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return console.error("Error deleting task:", error.message);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // Start Edit
  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditTask({ task: task.task, desc: task.desc });
    setErrors((prev) => ({ ...prev, edit: {} }));
  };

  // Save Edited Task
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
      .select()
      .single();

    if (error) return console.error("Error updating task:", error.message);

    setTasks((prev) =>
      prev.map((task) => (task.id === editingTaskId ? updatedTask : task))
    );
    setEditingTaskId(null);
    setEditTask({ task: "", desc: "" });
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditTask({ task: "", desc: "" });
    setErrors((prev) => ({ ...prev, edit: {} }));
  };

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <div
      className={`w-full mx-auto p-5 min-h-screen transition-colors duration-300 ${
        theme === "dark" ? "text-white" : "bg-white text-black"
      }`}
    >
      {/* Theme Toggle */}
      <span
        onClick={toggleTheme}
        className="md:flex hidden text-2xl absolute top-5 right-5 cursor-pointer hover:scale-110"
      >
        {theme === "dark" ? <MdDarkMode /> : <MdLightMode />}
      </span>

      {/* Add Task Form */}
      <form
        onSubmit={handleAdd}
        className={`w-full md:w-[400px] border rounded-lg p-5 mb-8 shadow-md transition-colors duration-300 relative ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800"
            : "border-gray-400 bg-white"
        }`}
      >
        {/* Mobile Theme Toggle */}
        <span
          onClick={toggleTheme}
          className="md:hidden text-2xl absolute top-3 right-5 cursor-pointer hover:scale-110"
        >
          {theme === "dark" ? <MdDarkMode /> : <MdLightMode />}
        </span>

        <h2 className="text-xl font-bold mb-4">Add New Task</h2>

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
          className="text-sm font-semibold bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 transition"
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
                <div className="flex flex-col w-full h-[150px] overflow-auto px-2">
                  <p className="font-semibold">Title - {task.task}</p>
                  <p className="text-gray-400 whitespace-pre-wrap break-words">
                    {task.desc}
                  </p>
                </div>
              )}

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
