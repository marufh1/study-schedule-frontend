import React from "react";
import { Link } from "react-router-dom";
import { Task } from "../types";

interface TaskListProps {
  tasks: Task[];
  onMarkComplete: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onMarkComplete }) => {
  if (tasks.length === 0) {
    return <div className="text-gray-500 text-center py-8">No tasks found. Add a new task to get started.</div>;
  }

  // Sort tasks by due date and then by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    // First compare due dates
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;

    // If due dates are the same, compare by priority (higher priority first)
    return b.priority - a.priority;
  });

  // Get priority color
  const getPriorityColor = (priority: any): string => {
    switch (priority) {
      case 5:
        return "bg-red-100 text-red-800";
      case 4:
        return "bg-orange-100 text-orange-800";
      case 3:
        return "bg-yellow-100 text-yellow-800";
      case 2:
        return "bg-blue-100 text-blue-800";
      case 1:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get complexity color
  const getComplexityColor = (complexity: string): string => {
    switch (complexity) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Is the task due soon (within 2 days)?
  const isDueSoon = (dateString: string): boolean => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays >= 0;
  };

  return (
    <div className="space-y-4">
      {sortedTasks.map((task) => (
        <div key={task._id} className={`border rounded-lg p-4 ${isDueSoon(task.dueDate) ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
          <div className="flex justify-between">
            <h3 className="font-semibold text-lg">{task.title}</h3>
            <div className="flex space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs ${getComplexityColor(task.complexityLevel)}`}>{task.complexityLevel}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>Priority {task.priority}</span>
            </div>
          </div>

          <p className="text-gray-600 mt-2">{task.description}</p>

          <div className="mt-4 flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">Due: </span>
              <span className={`text-sm ${isDueSoon(task.dueDate) ? "font-bold text-red-600" : ""}`}>{formatDate(task.dueDate)}</span>
              <span className="text-sm text-gray-500 ml-4">Estimated: </span>
              <span className="text-sm">{task.estimatedHours} hours</span>
            </div>

            <div className="flex space-x-2">
              <Link to={`/tasks/${task._id.toString()}/edit`} className="text-blue-500 hover:text-blue-700">
                Edit
              </Link>
              <button onClick={() => onMarkComplete(task._id.toString())} className="text-green-500 hover:text-green-700">
                Complete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
