import { OptimizationParams, StudySchedule } from "../types";
import API from "./api";

export const OptimizerService = {
  // Get optimized schedule
  optimizeSchedule: async (params: OptimizationParams): Promise<StudySchedule> => {
    const { userId, startDate, endDate } = params;
    const response = await API.get(`/optimizer/schedule/${userId}?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
};

export default OptimizerService;
