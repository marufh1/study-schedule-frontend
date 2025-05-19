// This file contains all the TypeScript interfaces used throughout the app

// User type
export interface User {
  _id: string;
  name: string;
  email: string;
}

// Schedule types
export interface Schedule {
  _id: string;
  day: string;
  type: "WORK" | "CLASS" | "STUDY";
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  location?: string;
  date: string; // ISO date string
  userId: string;
}

export interface ScheduleFormData {
  day: string;
  type: "WORK" | "CLASS" | "STUDY";
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  location?: string;
  date: string; // ISO date string
}

// Task types
export interface Task {
  _id: string;
  title: string;
  description: string;
  estimatedHours: number;
  priority: number; // 1-5
  dueDate: string; // ISO date string
  completed: boolean;
  subjectArea: string;
  complexityLevel: "LOW" | "MEDIUM" | "HIGH";
  userId: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  estimatedHours: number;
  priority: number; // 1-5
  dueDate: string; // ISO date string
  subjectArea: string;
  complexityLevel: "LOW" | "MEDIUM" | "HIGH";
}

// Energy level types
export interface EnergyLevel {
  _id: string;
  day: string;
  timeSlot: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  level: number; // 1-10
  date?: string; // ISO date string, optional
  userId: string;
}

export interface EnergyLevelFormData {
  day: string;
  timeSlot: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  level: number; // 1-10
  date?: string; // ISO date string, optional
}

// Optimizer types
export interface TimeSlot {
  day: string;
  date: string; // ISO date string
  startTime: string;
  endTime: string;
  duration: number; // in hours
  energyLevel: number; // 1-10
}

export interface StudyTask {
  _id: string;
  title: string;
  estimatedHours: number;
  priority: number; // 1-5
  dueDate: string; // ISO date string
  complexityLevel: "LOW" | "MEDIUM" | "HIGH";
  completed: boolean;
  subjectArea: string;
}

export interface StudyBlock {
  timeSlot: TimeSlot;
  task: StudyTask;
  hoursAssigned: number;
}

export interface StudySchedule {
  blocks: StudyBlock[];
  fitness: number;
}

export interface OptimizationParams {
  userId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}
