import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TaskService from "../services/task.service";
import { TaskFormData } from "../types";

interface TaskFormProps {
  userId: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ userId }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  console.log({ userId });
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    estimatedHours: 1,
    priority: 3,
    dueDate: "",
    subjectArea: "",
    complexityLevel: "MEDIUM",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If in edit mode, fetch the task data
    if (isEditMode) {
      const fetchTask = async () => {
        try {
          setLoading(true);
          const task = await TaskService.getById(id);

          // Format the date for the form (YYYY-MM-DD)
          const dueDate = new Date(task.dueDate);
          const formattedDate = dueDate.toISOString().split("T")[0];

          setFormData({
            title: task.title,
            description: task.description,
            estimatedHours: task.estimatedHours,
            priority: task.priority,
            dueDate: formattedDate,
            subjectArea: task.subjectArea,
            complexityLevel: task.complexityLevel as "LOW" | "MEDIUM" | "HIGH",
          });

          setError(null);
        } catch (err) {
          console.error("Error fetching task:", err);
          setError("Failed to load task data. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchTask();
    } else {
      // Set default due date to tomorrow for new tasks
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedDate = tomorrow.toISOString().split("T")[0];

      setFormData((prev) => ({
        ...prev,
        dueDate: formattedDate,
      }));
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "estimatedHours" || name === "priority" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isEditMode) {
        await TaskService.update(id, formData);
      } else {
        await TaskService.create(userId, formData);
      }

      // Navigate back to dashboard after successful submission
      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving task:", err);
      setError("Failed to save task. Please try again.");
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{isEditMode ? "Edit Task" : "Create New Task"}</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Task Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="estimatedHours" className="block text-gray-700 font-medium mb-2">
              Estimated Hours
            </label>
            <input
              type="number"
              id="estimatedHours"
              name="estimatedHours"
              value={formData.estimatedHours}
              onChange={handleChange}
              min="0.5"
              step="0.5"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-gray-700 font-medium mb-2">
              Priority (1-5)
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 - Low</option>
              <option value={2}>2 - Below Average</option>
              <option value={3}>3 - Average</option>
              <option value={4}>4 - High</option>
              <option value={5}>5 - Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="dueDate" className="block text-gray-700 font-medium mb-2">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="complexityLevel" className="block text-gray-700 font-medium mb-2">
              Complexity Level
            </label>
            <select
              id="complexityLevel"
              name="complexityLevel"
              value={formData.complexityLevel}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="subjectArea" className="block text-gray-700 font-medium mb-2">
            Subject Area
          </label>
          <input
            type="text"
            id="subjectArea"
            name="subjectArea"
            value={formData.subjectArea}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., MATH, COMPUTER_SCIENCE, DATA_SCIENCE"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditMode ? "Update Task" : "Create Task"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
