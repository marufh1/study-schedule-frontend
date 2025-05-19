/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OptimizerService from "../services/optimizer.service";
import ScheduleService from "../services/schedule.service";
import TaskService from "../services/task.service";
import { Schedule, StudyBlock, StudySchedule, Task } from "../types";

interface OptimizationResultProps {
  userId: string;
}

const OptimizationResult: React.FC<OptimizationResultProps> = ({ userId }) => {
  const navigate = useNavigate();

  const [optimizedSchedule, setOptimizedSchedule] = useState<StudySchedule | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  const [optimizing, setOptimizing] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch tasks
        const tasksData = await TaskService.getIncompleteByUserId(userId);
        setTasks(tasksData);

        // Fetch schedules
        const schedulesData = await ScheduleService.getByUserIdAndDateRange(userId, dateRange.startDate, dateRange.endDate);
        setSchedules(schedulesData);

        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, dateRange]);

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptimize = async () => {
    try {
      setOptimizing(true);

      const optimizedResult = await OptimizerService.optimizeSchedule({
        userId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      setOptimizedSchedule(optimizedResult);
      setError(null);
    } catch (err) {
      console.error("Error optimizing schedule:", err);
      setError("Failed to optimize schedule. Please try again.");
    } finally {
      setOptimizing(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!optimizedSchedule) return;

    try {
      setLoading(true);

      // Convert optimized blocks to schedule entries
      const studySchedules = optimizedSchedule.blocks.map((block) => ({
        day: block.timeSlot.day,
        type: "STUDY" as const,
        startTime: block.timeSlot.startTime,
        endTime: calculateEndTime(block.timeSlot.startTime, block.hoursAssigned),
        title: `${block.task.title} (Study)`,
        description: `Assigned study time for task: ${block.task.title}`,
        date: block.timeSlot.date,
        userId,
      }));

      // Create all study schedules
      await Promise.all(studySchedules.map((schedule) => ScheduleService.create(userId, schedule)));

      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving study schedule:", err);
      setError("Failed to save study schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate end time given a start time and duration in hours
  const calculateEndTime = (startTime: string, durationHours: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number);

    const totalMinutes = hours * 60 + minutes + durationHours * 60;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = Math.floor(totalMinutes % 60);

    return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format time
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Group blocks by date
  const groupBlocksByDate = (blocks: StudyBlock[]): Record<string, StudyBlock[]> => {
    return blocks.reduce((groups, block) => {
      const date = block.timeSlot.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(block);
      return groups;
    }, {} as Record<string, StudyBlock[]>);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-6">Optimize Your Study Schedule</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="mb-6">
          <p className="text-gray-600 mb-4">Select a date range to optimize your study schedule. The optimizer will consider your:</p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Work and class schedules</li>
            <li>Task deadlines and priorities</li>
            <li>Energy level patterns throughout the day</li>
            <li>Task complexity and estimated time requirements</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-gray-700 font-medium mb-2">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Tasks to Schedule: {tasks.length}</h3>
          <div className="bg-gray-100 p-3 rounded-md">
            {tasks.length === 0 ? (
              <p className="text-gray-500">No incomplete tasks found. Add tasks first.</p>
            ) : (
              <ul className="space-y-1">
                {tasks.slice(0, 5).map((task) => (
                  <li key={task._id} className="text-sm">
                    <span className="font-medium">{task.title}</span>
                    <span className="text-gray-500 ml-2">
                      ({task.estimatedHours} hrs, due {formatDate(task.dueDate)})
                    </span>
                  </li>
                ))}
                {tasks.length > 5 && <li className="text-sm text-gray-500">...and {tasks.length - 5} more tasks</li>}
              </ul>
            )}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleOptimize}
            disabled={optimizing || tasks.length === 0}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {optimizing ? "Optimizing..." : "Optimize Schedule"}
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {optimizedSchedule && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Optimized Study Schedule</h2>

            <button
              onClick={handleSaveSchedule}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Save Schedule
            </button>
          </div>

          {Object.entries(groupBlocksByDate(optimizedSchedule.blocks))
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .map(([date, blocks]) => (
              <div key={date} className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  {formatDate(date)} ({new Date(date).toLocaleDateString("en-US", { weekday: "long" })})
                </h3>

                <div className="space-y-3">
                  {blocks
                    .sort((a, b) => {
                      const timeA = a.timeSlot.startTime.split(":").map(Number);
                      const timeB = b.timeSlot.startTime.split(":").map(Number);
                      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
                    })
                    .map((block, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4 bg-blue-50">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">
                              {formatTime(block.timeSlot.startTime)} - {formatTime(calculateEndTime(block.timeSlot.startTime, block.hoursAssigned))}
                            </h4>
                            <p className="text-lg font-semibold mt-1">{block.task.title}</p>
                          </div>

                          <div className="text-right">
                            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{block.hoursAssigned} hours</span>
                            <div className="text-sm text-gray-500 mt-1">Energy level: {block.timeSlot.energyLevel}/10</div>
                          </div>
                        </div>

                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">Task due: {formatDate(block.task.dueDate)}</span>
                          <span className="ml-3 text-gray-500">Priority: {block.task.priority}/5</span>
                          <span className="ml-3 text-gray-500">Complexity: {block.task.complexityLevel}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}

          <div className="text-center mt-8 text-gray-500">
            <p>Optimization score: {optimizedSchedule.fitness.toFixed(2)}</p>
            <p className="text-sm mt-1">Higher scores indicate better matching of tasks to energy levels and deadlines.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizationResult;
