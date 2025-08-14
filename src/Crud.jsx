import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const Crud = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ task: "", desc: "" });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTask, setEditTask] = useState({ task: "", desc: "" });
  const [errors, setErrors] = useState({ add: {}, edit: {} }); // Track errors

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*");
    if (error) console.error("Error fetching tasks:", error.message);
    else setTasks(data || []);
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

  // Delete task
  const handleDelete = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return console.error("Error deleting task:", error.message);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // Start editing
  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditTask({ task: task.task, desc: task.desc });
    setErrors((prev) => ({ ...prev, edit: {} }));
  };

  // Save edit
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

  return (
    <div className="max-w-xl mx-auto p-5">
      {/* Add Task Form */}
      <form
        onSubmit={handleAdd}
        className="border border-gray-400 rounded-lg p-5 mb-8 shadow-md"
      >
        <h2 className="text-xl font-bold mb-4">Add New Task</h2>
        <input
          value={newTask.task}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, task: e.target.value }))
          }
          className={`border rounded px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 ${
            errors.add.task
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-400 focus:ring-blue-400"
          }`}
          type="text"
          placeholder="Task"
        />
        <input
          value={newTask.desc}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, desc: e.target.value }))
          }
          className={`border rounded px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 ${
            errors.add.desc
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-400 focus:ring-blue-400"
          }`}
          type="text"
          placeholder="Description"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 transition"
        >
          Add
        </button>
      </form>

      {/* Task List */}
      <ul className="space-y-4">
        {tasks.filter(Boolean).map((task) => (
          <li
            key={task.id}
            className="flex justify-between items-center border border-gray-400 rounded p-3 shadow-sm"
          >
            {editingTaskId === task.id ? (
              <div className="flex-1 flex flex-col gap-2">
                <input
                  value={editTask.task}
                  onChange={(e) =>
                    setEditTask((prev) => ({ ...prev, task: e.target.value }))
                  }
                  className={`border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 ${
                    errors.edit.task
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-400 focus:ring-blue-400"
                  }`}
                />
                <input
                  value={editTask.desc}
                  onChange={(e) =>
                    setEditTask((prev) => ({ ...prev, desc: e.target.value }))
                  }
                  className={`border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 ${
                    errors.edit.desc
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-400 focus:ring-blue-400"
                  }`}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <p className="font-semibold">{task.task}</p>
                <p className="text-gray-600">{task.desc}</p>
              </div>
            )}

            <div className="flex gap-2 ml-4">
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
                <>
                  <button
                    onClick={() => startEdit(task)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Crud;
