import { Schedule, ScheduleFormData } from "../types";
import API from "./api";

export const ScheduleService = {
  // Get all schedules
  getAll: async (): Promise<Schedule[]> => {
    const response = await API.get("/schedules");
    return response.data;
  },

  // Get schedule by ID
  getById: async (id: any): Promise<Schedule> => {
    const response = await API.get(`/schedules/${id}`);
    return response.data;
  },

  // Get schedules by user ID
  getByUserId: async (userId: any): Promise<Schedule[]> => {
    const response = await API.get(`/schedules/user/${userId}`);
    return response.data;
  },

  // Get schedules by user ID and date range
  getByUserIdAndDateRange: async (userId: any, startDate: string, endDate: string): Promise<Schedule[]> => {
    const response = await API.get(`/schedules/user/${userId}/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Create a new schedule
  create: async (userId: any, scheduleData: ScheduleFormData): Promise<Schedule> => {
    const schedule = {
      ...scheduleData,
      userId,
    };
    const response = await API.post("/schedules", schedule);
    return response.data;
  },

  // Update a schedule
  update: async (id: any, scheduleData: Partial<Schedule>): Promise<Schedule> => {
    const response = await API.put(`/schedules/${id}`, scheduleData);
    return response.data;
  },

  // Delete a schedule
  delete: async (id: any): Promise<void> => {
    await API.delete(`/schedules/${id}`);
  },
};

export default ScheduleService;
