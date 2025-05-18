import React, { ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ScheduleService from "../services/schedule.service";
import TaskService from "../services/task.service";
import { Schedule, Task } from "../types";
import ScheduleCalendar from "./ScheduleCalendar";
import TaskList from "./TaskList";

interface DashboardProps {
  userId: string;
}

// Change to ReactElement return type
const Dashboard: React.FC<DashboardProps> = ({ userId }): ReactElement => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get upcoming tasks
        const tasksData = await TaskService.getIncompleteByUserId(userId);

        // Get schedules for the next 2 weeks
        const today = new Date();
        const twoWeeksFromNow = new Date();
        twoWeeksFromNow.setDate(today.getDate() + 14);

        const schedulesData = await ScheduleService.getByUserIdAndDateRange(userId, today.toISOString(), twoWeeksFromNow.toISOString());

        setTasks(tasksData);
        setSchedules(schedulesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleMarkComplete = async (taskId: string) => {
    try {
      await TaskService.markComplete(taskId);
      // Update local state after marking complete
      setTasks(tasks.filter((task) => task.id.toString() !== taskId));
    } catch (err) {
      console.error("Error marking task complete:", err);
      setError("Failed to update task. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upcoming Tasks</h2>
            <Link to="/tasks/new" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Add Task
            </Link>
          </div>

          <TaskList tasks={tasks} onMarkComplete={handleMarkComplete} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Schedule</h2>
            <div className="space-x-2">
              <Link to="/schedules/new" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Add Schedule
              </Link>
              <Link to="/optimize" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                Optimize
              </Link>
            </div>
          </div>

          <ScheduleCalendar schedules={schedules} />
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Energy Levels</h2>
          <Link to="/energy/new" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Update Energy Levels
          </Link>
        </div>

        <p className="text-gray-600 mb-4">
          Track your energy levels throughout the week to optimize your study schedule for peak productivity times.
        </p>

        <div className="flex flex-wrap gap-4">
          {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => (
            <div key={day} className="bg-gray-100 p-4 rounded-lg w-full sm:w-auto flex-grow">
              <h3 className="font-semibold">{day}</h3>
              <p>Set your typical energy levels for each part of the day</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
