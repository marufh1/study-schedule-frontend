import { EnergyLevel, EnergyLevelFormData } from "../types";
import API from "./api";

export const EnergyLevelService = {
  // Get all energy levels
  getAll: async (): Promise<EnergyLevel[]> => {
    const response = await API.get("/energy-levels");
    return response.data;
  },

  // Get energy level by ID
  getById: async (id: string): Promise<EnergyLevel> => {
    const response = await API.get(`/energy-levels/${id}`);
    return response.data;
  },

  // Get energy levels by user ID
  getByUserId: async (userId: string): Promise<EnergyLevel[]> => {
    const response = await API.get(`/energy-levels/user/${userId}`);
    return response.data;
  },

  // Get energy levels by user ID and day
  getByUserIdAndDay: async (userId: string, day: string): Promise<EnergyLevel[]> => {
    const response = await API.get(`/energy-levels/user/${userId}/day/${day}`);
    return response.data;
  },

  // Create a new energy level
  create: async (userId: string, energyLevelData: EnergyLevelFormData): Promise<EnergyLevel> => {
    const energyLevel = {
      ...energyLevelData,
      userId,
    };
    const response = await API.post("/energy-levels", energyLevel);
    return response.data;
  },

  // Update an energy level
  update: async (id: string, energyLevelData: Partial<EnergyLevel>): Promise<EnergyLevel> => {
    const response = await API.put(`/energy-levels/${id}`, energyLevelData);
    return response.data;
  },

  // Delete an energy level
  delete: async (id: string): Promise<void> => {
    await API.delete(`/energy-levels/${id}`);
  },
};

export default EnergyLevelService;
