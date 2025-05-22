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
        const tasksData = await TaskService.getIncompleteByUserId(userId);
        setTasks(tasksData);
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

      await Promise.all(studySchedules.map((schedule) => ScheduleService.create(userId, schedule)));
      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving study schedule:", err);
      setError("Failed to save study schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateEndTime = (startTime: string, durationHours: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationHours * 60;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = Math.floor(totalMinutes % 60);
    return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

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

  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1:
        return "Low";
      case 2:
        return "Below Average";
      case 3:
        return "Average";
      case 4:
        return "High";
      case 5:
        return "Urgent";
      default:
        return "Unknown";
    }
  };

  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1:
        return "bg-gray-100 text-gray-600";
      case 2:
        return "bg-blue-50 text-blue-600";
      case 3:
        return "bg-green-50 text-green-600";
      case 4:
        return "bg-yellow-50 text-yellow-600";
      case 5:
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
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
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Optimize Your Study Schedule</h2>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}

        <div className="mb-5 bg-blue-50 p-4 rounded border border-blue-100">
          <p className="text-gray-700 mb-2 font-medium">Select a date range to optimize your study schedule. The optimizer will consider your:</p>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li>Work and class schedules</li>
            <li>Task deadlines and priorities</li>
            <li>Energy level patterns throughout the day</li>
            <li>Task complexity and estimated time requirements</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label htmlFor="startDate" className="block text-gray-700 font-medium mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-gray-700 font-medium mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mb-5">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Tasks to Schedule: {tasks.length}</h3>
          {tasks.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded text-center">
              <p className="text-gray-500">No incomplete tasks found. Add tasks first.</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm uppercase tracking-wider">Task</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm uppercase tracking-wider">Hours</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm uppercase tracking-wider">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm uppercase tracking-wider">Priority</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.slice(0, 5).map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">{task.title}</td>
                      <td className="py-3 px-4 text-gray-800">{task.estimatedHours}</td>
                      <td className="py-3 px-4 text-gray-800">{formatDate(task.dueDate)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {tasks.length > 5 && (
                    <tr>
                      <td colSpan={4} className="py-3 px-4 text-center text-gray-500">
                        ...and {tasks.length - 5} more tasks
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleOptimize}
            disabled={optimizing || tasks.length === 0}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none disabled:opacity-50 transition-colors duration-150"
          >
            {optimizing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Optimizing...
              </span>
            ) : (
              "Optimize Schedule"
            )}
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded focus:outline-none transition-colors duration-150"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {optimizedSchedule && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-gray-800">Optimized Study Schedule</h2>

            <button
              onClick={handleSaveSchedule}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded focus:outline-none transition-colors duration-150"
            >
              Save Schedule
            </button>
          </div>

          <div className="text-center p-3 bg-green-50 border border-green-100 rounded mb-5">
            <p className="font-medium text-green-700">Optimization Score: {optimizedSchedule.fitness.toFixed(2)}</p>
            <p className="text-sm text-green-600">Higher scores indicate better matching of tasks to energy levels and deadlines</p>
          </div>

          {Object.entries(groupBlocksByDate(optimizedSchedule.blocks))
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .map(([date, blocks]) => (
              <div key={date} className="mb-6">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-blue-600 font-bold">
                    {new Date(date).getDate()}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {formatDate(date)} ({new Date(date).toLocaleDateString("en-US", { weekday: "long" })})
                  </h3>
                </div>

                <div className="space-y-3">
                  {blocks
                    .sort((a, b) => {
                      const timeA = a.timeSlot.startTime.split(":").map(Number);
                      const timeB = b.timeSlot.startTime.split(":").map(Number);
                      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
                    })
                    .map((block, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow duration-150">
                        <div className="flex justify-between">
                          <div>
                            <div className="text-blue-600 font-medium">
                              {formatTime(block.timeSlot.startTime)} - {formatTime(calculateEndTime(block.timeSlot.startTime, block.hoursAssigned))}
                            </div>
                            <div className="text-lg font-semibold mt-1 text-gray-800">{block.task.title}</div>
                          </div>

                          <div className="text-right">
                            <span className="inline-block bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-sm font-medium">
                              {block.hoursAssigned} {block.hoursAssigned === 1 ? "hour" : "hours"}
                            </span>
                            <div className="text-sm text-gray-600 mt-1">Energy level: {block.timeSlot.energyLevel}/10</div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-4">
                          <div>
                            <span className="text-xs text-gray-500 block">Due Date</span>
                            <span className="font-medium text-gray-700">{formatDate(block.task.dueDate)}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Priority</span>
                            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(block.task.priority)}`}>
                              {getPriorityLabel(block.task.priority)}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Complexity</span>
                            <span className="font-medium text-gray-700">{block.task.complexityLevel}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default OptimizationResult;
