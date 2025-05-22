import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ScheduleService from "../services/schedule.service";
import { ScheduleFormData } from "../types";

interface ScheduleFormProps {
  userId: string;
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

  // New state for recurring schedules
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(["MONDAY"]);
  const [recurringEndDate, setRecurringEndDate] = useState<string>("");
  const [numDays, setNumDays] = useState<number>(15); // Default to 15 days

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If in edit mode, fetch the schedule data
    if (isEditMode) {
      const fetchSchedule = async () => {
        try {
          setLoading(true);
          const schedule = await ScheduleService.getById(id as string);

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

      // Set default recurring end date to 15 days from today
      const endDate = new Date();
      endDate.setDate(today.getDate() + numDays - 1); // Subtract 1 to include today
      setRecurringEndDate(endDate.toISOString().split("T")[0]);
    }
  }, [id, isEditMode, numDays]);

  // Update end date when numDays changes
  useEffect(() => {
    if (!isEditMode && formData.date) {
      try {
        const startDate = new Date(formData.date);
        // Ensure we have a valid date before proceeding
        if (!isNaN(startDate.getTime())) {
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + numDays - 1); // Subtract 1 to include start date
          setRecurringEndDate(endDate.toISOString().split("T")[0]);
        }
      } catch (error) {
        console.error("Error calculating end date:", error);
      }
    }
  }, [formData.date, numDays, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDaySelect = (day: string) => {
    if (isRecurring) {
      // For recurring schedules, toggle the day selection
      setSelectedDays((prev) => {
        if (prev.includes(day)) {
          return prev.filter((d) => d !== day);
        } else {
          return [...prev, day];
        }
      });
    } else {
      // For single schedules, just set the day
      setFormData((prev) => ({
        ...prev,
        day,
      }));
    }
  };

  const toggleRecurring = () => {
    setIsRecurring((prev) => !prev);
    if (!isRecurring) {
      // When enabling recurring, set the selected days to the current day
      setSelectedDays([formData.day]);
    }
  };

  // Calculate number of days between two dates
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const endDateValue = e.target.value;
      setRecurringEndDate(endDateValue);

      if (formData.date && endDateValue) {
        const endDate = new Date(endDateValue);
        const startDate = new Date(formData.date);

        // Validate dates
        if (!isNaN(endDate.getTime()) && !isNaN(startDate.getTime())) {
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
          setNumDays(diffDays);
        }
      }
    } catch (error) {
      console.error("Error handling end date change:", error);
    }
  };

  // Handle number of days change
  const handleNumDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const days = parseInt(e.target.value);
    setNumDays(days);
  };

  // Generate dates for recurring schedules
  const generateRecurringDates = (): ScheduleFormData[] => {
    const schedules: ScheduleFormData[] = [];

    try {
      const startDate = new Date(formData.date);
      const endDate = new Date(recurringEndDate);

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date range");
      }

      const dayMap: Record<string, number> = {
        SUNDAY: 0,
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6,
      };

      const selectedDayIndices = selectedDays.map((day) => dayMap[day]);

      // Loop through each day in the date range
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay();

        // If this day of the week is selected
        if (selectedDayIndices.includes(dayOfWeek)) {
          const formattedDate = date.toISOString().split("T")[0];
          const dayName = Object.keys(dayMap).find((key) => dayMap[key] === dayOfWeek) || "MONDAY";

          schedules.push({
            ...formData,
            day: dayName,
            date: formattedDate,
          });
        }
      }
    } catch (error) {
      console.error("Error generating recurring dates:", error);
      setError("Failed to generate recurring dates. Please check your date inputs.");
    }

    return schedules;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isEditMode) {
        // Update mode - only update the single schedule
        await ScheduleService.update(id as string, formData);
      } else if (isRecurring) {
        // Create recurring schedules
        const recurringSchedules = generateRecurringDates();

        if (recurringSchedules.length === 0) {
          setError("No schedules would be created with the current day selection. Please select at least one day.");
          setLoading(false);
          return;
        }

        await ScheduleService.createMany(userId, recurringSchedules);
      } else {
        // Create a single schedule
        await ScheduleService.create(userId, formData);
      }

      // Navigate back to dashboard after successful submission
      navigate("/schedules");
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

  const DAYS_OF_WEEK = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{isEditMode ? "Edit Working Schedule" : "Add Working Schedule"}</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!isEditMode && (
          <div className="mb-4">
            <div className="flex items-center">
              <input type="checkbox" id="recurringToggle" checked={isRecurring} onChange={toggleRecurring} className="mr-2 h-5 w-5" />
              <label htmlFor="recurringToggle" className="text-gray-700 font-medium">
                Create recurring schedule
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-1">Use this option to create schedules for multiple days at once</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">{isRecurring ? "Select Days of Week" : "Day of Week"}</label>
          <div className="grid grid-cols-7 gap-1">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleDaySelect(day)}
                className={`py-2 text-center rounded-md ${
                  isRecurring
                    ? selectedDays.includes(day)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : formData.day === day
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
            <option value="PERSONAL">Personal</option>
            <option value="MEETING">Meeting</option>
            <option value="PROJECT">Project</option>
            <option value="OTHER">Other</option>
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

        {isRecurring ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
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
                  value={recurringEndDate}
                  onChange={handleEndDateChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="numDays" className="block text-gray-700 font-medium mb-2">
                Number of Days
              </label>
              <input
                type="number"
                id="numDays"
                min="1"
                max="365"
                value={numDays}
                onChange={handleNumDaysChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">This will create schedules for the selected days of the week within this date range</p>
            </div>
          </div>
        ) : (
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
        )}

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
            {loading ? "Saving..." : isEditMode ? "Update Schedule" : isRecurring ? "Create Recurring Schedules" : "Create Schedule"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/schedules")}
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
