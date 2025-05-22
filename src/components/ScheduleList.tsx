import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScheduleService from "../services/schedule.service";
import { Schedule } from "../types";

interface ScheduleListProps {
  userId: string;
}

const ScheduleList: React.FC<ScheduleListProps> = ({ userId }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchedules();
  }, [userId]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      // Get all schedules except STUDY type
      const data = await ScheduleService.getByUserIdExceptType(userId, "STUDY");
      setSchedules(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError("Failed to load schedules. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        await ScheduleService.delete(id);
        // Refresh the list after deletion
        fetchSchedules();
      } catch (err) {
        console.error("Error deleting schedule:", err);
        setError("Failed to delete schedule. Please try again.");
      }
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/schedules/${id}/edit`);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Working Schedules</h2>
        <button onClick={() => navigate("/schedules/new")} className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md">
          Add Working Schedule
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      {schedules.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-600">You don't have any working time schedules yet.</p>
          <button
            onClick={() => navigate("/schedules/new")}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
          >
            Add Your First Schedule
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr key={schedule._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{schedule.day}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(schedule.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {schedule.startTime} - {schedule.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{schedule.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{schedule.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{schedule.location || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleEdit(schedule._id)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(schedule._id)} className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleList;
