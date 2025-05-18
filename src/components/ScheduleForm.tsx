import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ScheduleService from "../services/schedule.service";
import { ScheduleFormData } from "../types";

interface ScheduleFormProps {
  userId: number;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ userId }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<ScheduleFormData>({
    day: "MONDAY",
    type: "WORK",
    startTime: "09:00",
    endTime: "17:00",
    title: "",
    description: "",
    location: "",
    date: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If in edit mode, fetch the schedule data
    if (isEditMode) {
      const fetchSchedule = async () => {
        try {
          setLoading(true);
          const schedule = await ScheduleService.getById(parseInt(id));

          // Format the date for the form (YYYY-MM-DD)
          const scheduleDate = new Date(schedule.date);
          const formattedDate = scheduleDate.toISOString().split("T")[0];

          setFormData({
            day: schedule.day,
            type: schedule.type as "WORK" | "CLASS" | "STUDY",
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            title: schedule.title,
            description: schedule.description || "",
            location: schedule.location || "",
            date: formattedDate,
          });

          setError(null);
        } catch (err) {
          console.error("Error fetching schedule:", err);
          setError("Failed to load schedule data. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchSchedule();
    } else {
      // Set default date to today for new schedules
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];

      setFormData((prev) => ({
        ...prev,
        date: formattedDate,
      }));
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDaySelect = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      day,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isEditMode) {
        await ScheduleService.update(parseInt(id), formData);
      } else {
        await ScheduleService.create(userId, formData);
      }

      // Navigate back to dashboard after successful submission
      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving schedule:", err);
      setError("Failed to save schedule. Please try again.");
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{isEditMode ? "Edit Schedule" : "Create New Schedule"}</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Day of Week</label>
          <div className="grid grid-cols-7 gap-1">
            {["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleDaySelect(day)}
                className={`py-2 text-center rounded-md ${
                  formData.day === day ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="type" className="block text-gray-700 font-medium mb-2">
            Schedule Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="WORK">Work</option>
            <option value="CLASS">Class</option>
            <option value="STUDY">Study</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`e.g., ${
              formData.type === "WORK" ? "Work at Company XYZ" : formData.type === "CLASS" ? "Database Systems Class" : "Study Session"
            }`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="startTime" className="block text-gray-700 font-medium mb-2">
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-gray-700 font-medium mb-2">
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="location" className="block text-gray-700 font-medium mb-2">
            Location (optional)
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Office, Room 101, Home Office"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional details about this schedule"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditMode ? "Update Schedule" : "Create Schedule"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;
