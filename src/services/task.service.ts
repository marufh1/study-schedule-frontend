import { Task, TaskFormData } from "../types";
import API from "./api";

export const TaskService = {
  // Get all tasks
  getAll: async (): Promise<Task[]> => {
    const response = await API.get("/tasks");
    return response.data;
  },

  // Get task by ID
  getById: async (id: any): Promise<Task> => {
    const response = await API.get(`/tasks/${id}`);
    return response.data;
  },

  // Get tasks by user ID
  getByUserId: async (userId: any): Promise<Task[]> => {
    const response = await API.get(`/tasks/user/${userId}`);
    return response.data;
  },

  // Get incomplete tasks by user ID
  getIncompleteByUserId: async (userId: any): Promise<Task[]> => {
    const response = await API.get(`/tasks/user/${userId}/incomplete`);
    return response.data;
  },

  // Get upcoming tasks by user ID
  getUpcomingByUserId: async (userId: any, daysAhead = 7): Promise<Task[]> => {
    const response = await API.get(`/tasks/user/${userId}/upcoming?daysAhead=${daysAhead}`);
    return response.data;
  },

  // Create a new task
  create: async (userId: any, taskData: TaskFormData): Promise<Task> => {
    const task = {
      ...taskData,
      completed: false,
      userId,
    };
    const response = await API.post("/tasks", task);
    return response.data;
  },

  // Update a task
  update: async (id: any, taskData: Partial<Task>): Promise<Task> => {
    const response = await API.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Mark a task as complete
  markComplete: async (id: any): Promise<Task> => {
    return TaskService.update(id, { completed: true });
  },

  // Delete a task
  delete: async (id: any): Promise<void> => {
    await API.delete(`/tasks/${id}`);
  },
};

export default TaskService;
