import { Schedule, ScheduleFormData } from "../types";
import API from "./api";

export const ScheduleService = {
  // Get all schedules
  getAll: async (): Promise<Schedule[]> => {
    const response = await API.get("/schedules");
    return response.data;
  },

  // Get schedule by ID
  getById: async (id: string): Promise<Schedule> => {
    const response = await API.get(`/schedules/${id}`);
    return response.data;
  },

  // Get schedules by user ID
  getByUserId: async (userId: string): Promise<Schedule[]> => {
    const response = await API.get(`/schedules/user/${userId}`);
    return response.data;
  },

  // Get schedules by user ID except specific type
  getByUserIdExceptType: async (userId: string, excludeType: string): Promise<Schedule[]> => {
    const response = await API.get(`/schedules/user/${userId}/exclude/${excludeType}`);
    return response.data;
  },

  // Get schedules by user ID and date range
  getByUserIdAndDateRange: async (userId: string, startDate: string, endDate: string): Promise<Schedule[]> => {
    const response = await API.get(`/schedules/user/${userId}/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Create a new schedule
  create: async (userId: string, scheduleData: ScheduleFormData): Promise<Schedule> => {
    const schedule = {
      ...scheduleData,
      userId,
    };
    const response = await API.post("/schedules", schedule);
    return response.data;
  },

  // Create multiple schedules at once
  createMany: async (userId: string, schedulesData: ScheduleFormData[]): Promise<Schedule[]> => {
    const schedules = schedulesData.map((scheduleData) => ({
      ...scheduleData,
      userId,
    }));
    const response = await API.post("/schedules/bulk", schedules);
    return response.data;
  },

  // Update a schedule
  update: async (id: string, scheduleData: Partial<Schedule>): Promise<Schedule> => {
    const response = await API.put(`/schedules/${id}`, scheduleData);
    return response.data;
  },

  // Delete a schedule
  delete: async (id: string): Promise<void> => {
    await API.delete(`/schedules/${id}`);
  },
};

export default ScheduleService;
